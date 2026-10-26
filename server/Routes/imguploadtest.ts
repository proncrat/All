import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs/promises'
import sharp from 'sharp'
import { randomUUID } from 'crypto'

import { newPhoto, getIdMatch, newmessage } from '../database'
import { authMiddleware } from '../middleware/enpointauth'

const router = express.Router()
router.use(authMiddleware)

const THUMB_WIDTH = 320
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
const ALLOWED_MIMETYPES = /^image\/(jpeg|png|webp|gif)$/

// Client-supplied fields that are allowed through to newPhoto.
// Adjust to match your photo columns. Everything else (url, thumburl,
// author_id, uploaded_at) is set server-side.
const ALLOWED_PHOTO_FIELDS = ['caption', 'album_id'] as const

// ---------- helpers ----------

/** Creates a thumbnail next to the original and returns its full path. */
async function makeThumbnail(srcPath: string): Promise<string> {
  const { dir, name } = path.parse(srcPath)
  const thumbPath = path.join(dir, `${name}_thumb.webp`)

  await sharp(srcPath)
    .rotate() // apply EXIF orientation, otherwise phone photos come out sideways
    .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
    .webp({ quality: 60 })
    .toFile(thumbPath)

  return thumbPath
}

/** Best-effort file deletion; never throws. */
async function cleanup(paths: string[]) {
  await Promise.all(paths.map((p) => fs.unlink(p).catch(() => {})))
}

export async function getLinkId(authUserId: string) {
  try {
    return await getIdMatch(authUserId)
  } catch (error) {
    throw new Error('link id error', { cause: error })
  }
}

function pick<T extends object, K extends keyof any>(
  obj: T,
  keys: readonly K[],
): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const key of keys) {
    if (key in obj) out[key as string] = (obj as any)[key]
  }
  return out
}

// ---------- multer ----------

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/images')
  },
  filename: (req, file, cb) => {
    cb(null, randomUUID() + path.extname(file.originalname).toLowerCase())
  },
})

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    // Rejected files leave req.file undefined, handled in the route below
    cb(null, ALLOWED_MIMETYPES.test(file.mimetype))
  },
}).single('image')

// Wrapper so multer errors (e.g. file too large) return a 400 instead of a 500
const handleUpload: express.RequestHandler = (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).send(err.message)
    }
    next(err)
  })
}

// ---------- route ----------

router.post('/', handleUpload, async (req, res, next) => {
  const file = req.file
  if (!file) {
    return res.status(400).send('No valid image uploaded')
  }

  // Every file written to disk for this request, so we can clean up on failure
  const createdFiles: string[] = [file.path]

  try {
    const { msgdata: rawMsgdata } = req.body

    // msgdata is optional: only present when the upload comes from chat
    let msgdata: Record<string, unknown> | null = null
    if (rawMsgdata) {
      try {
        msgdata = JSON.parse(rawMsgdata)
      } catch {
        await cleanup(createdFiles)
        return res.status(400).send('Invalid msgdata')
      }
    }

    // Identify the uploader from the session, never from the request body
    const user = await getLinkId(res.locals.session.session.userId)
    if (!user) {
      await cleanup(createdFiles)
      return res.status(400).send('Invalid login credentials')
    }

    const url = `/images/${file.filename}`

    // Chat upload: store the message only, no thumbnail needed
    if (msgdata) {
      await newmessage({
        ...msgdata,
        senderid: user.id,
        send_date: new Date(),
        text: url,
      })
      return res.status(200).json({ url })
    }

    // Photo upload: generate thumbnail and store the photo
    const thumbPath = await makeThumbnail(file.path)
    createdFiles.push(thumbPath)

    await newPhoto({
      ...pick(req.body, ALLOWED_PHOTO_FIELDS),
      url,
      thumburl: `/images/${path.basename(thumbPath)}`,
      author_id: user.id,
      uploaded_at: new Date(),
    })

    return res.status(201).json({ url })
  } catch (err) {
    console.error('photo upload failed:', err)
    await cleanup(createdFiles)
    next(err)
  }
})

export default router
