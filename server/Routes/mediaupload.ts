import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs/promises'
import sharp from 'sharp'
import { randomUUID } from 'crypto'

import {
  getAlbumRow,
  getIdMatch,
  newPost,
  newSong,
  newVideo,
  nextTrackNumber,
} from '../database'
import { authMiddleware } from '../middleware/enpointauth'

const router = express.Router()
router.use(authMiddleware)

const MAX_FILE_SIZE = 1024 * 1024 * 1024 // 1 GB per file (videos are big)
const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10 MB, checked after upload

const VIDEO_TYPES = /^video\/(mp4|webm|ogg|quicktime)$/
const AUDIO_TYPES =
  /^audio\/(mpeg|mp3|mp4|x-m4a|m4a|aac|ogg|wav|x-wav|wave|webm|flac|x-flac)$/
const IMAGE_TYPES = /^image\/(jpeg|png|webp|gif)$/

// Folder (under ./public) and accepted mimetypes for each form field
const FIELDS: Record<string, { dir: string; types: RegExp }> = {
  video: { dir: 'video', types: VIDEO_TYPES },
  audio: { dir: 'audio', types: AUDIO_TYPES },
  thumbnail: { dir: 'images', types: IMAGE_TYPES },
  cover: { dir: 'images', types: IMAGE_TYPES },
  images: { dir: 'images', types: IMAGE_TYPES }, // post attachments
}

const MAX_NAME = 200
const MAX_DESCRIPTION = 5000

// ---------- helpers ----------

export type Files = Record<string, Express.Multer.File[] | undefined>

export function allFiles(req: express.Request): Express.Multer.File[] {
  return Object.values((req.files ?? {}) as Files).flatMap((f) => f ?? [])
}

/** Best-effort file deletion; never throws. */
export async function cleanup(paths: string[]) {
  await Promise.all(paths.map((p) => fs.unlink(p).catch(() => {})))
}

/** Converts an uploaded image to a resized webp and removes the original. */
export async function toWebp(srcPath: string, width: number): Promise<string> {
  const { dir, name } = path.parse(srcPath)
  const outPath = path.join(dir, `${name}.webp`)
  const tmpPath = path.join(dir, `${name}.tmp.webp`)
  await sharp(srcPath)
    .rotate() // respect EXIF orientation
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 75 })
    .toFile(tmpPath)
  await fs.unlink(srcPath).catch(() => {})
  await fs.rename(tmpPath, outPath)
  return outPath
}

export function text(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

/** Accepts "m:ss" or "h:mm:ss". */
function validRuntime(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const v = value.trim()
  return /^(\d+:)?\d{1,2}:\d{2}$/.test(v) ? v : null
}

// ---------- multer ----------

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join('./public', FIELDS[file.fieldname].dir))
  },
  filename: (req, file, cb) => {
    cb(null, randomUUID() + path.extname(file.originalname).toLowerCase())
  },
})

/** `maxCounts` lets a field take several files (default 1 each). */
export function makeUpload(
  fields: string[],
  maxCounts: Record<string, number> = {},
): express.RequestHandler {
  const total = fields.reduce((n, f) => n + (maxCounts[f] ?? 1), 0)
  const upload = multer({
    storage,
    limits: { fileSize: MAX_FILE_SIZE, files: total },
    fileFilter: (req, file, cb) => {
      const rule = FIELDS[file.fieldname]
      if (!rule || !fields.includes(file.fieldname)) {
        return cb(
          new multer.MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname),
        )
      }
      if (!rule.types.test(file.mimetype)) {
        return cb(new Error(`Unsupported file type for ${file.fieldname}`))
      }
      cb(null, true)
    },
  }).fields(fields.map((name) => ({ name, maxCount: maxCounts[name] ?? 1 })))

  // Bad uploads return a 400 with a message instead of a generic 500
  return (req, res, next) => {
    upload(req, res, async (err) => {
      const paths = allFiles(req).map((f) => f.path)
      if (err) {
        await cleanup(paths)
        return res.status(400).json({ message: err.message })
      }
      const bigImage = allFiles(req).some(
        (f) => IMAGE_TYPES.test(f.mimetype) && f.size > MAX_IMAGE_SIZE,
      )
      if (bigImage) {
        await cleanup(paths)
        return res.status(400).json({ message: 'Images must be under 10 MB' })
      }
      next()
    })
  }
}

// ---------- routes ----------

router.post(
  '/video',
  makeUpload(['video', 'thumbnail']),
  async (req, res, next) => {
    const files = req.files as Files
    const video = files.video?.[0]
    const thumb = files.thumbnail?.[0]
    const created = allFiles(req).map((f) => f.path)

    const fail = async (message: string) => {
      await cleanup(created)
      return res.status(400).json({ message })
    }

    try {
      if (!video) return fail('No video uploaded')
      const name = text(req.body.name, MAX_NAME)
      if (!name) return fail('Name is required')

      // Identify the uploader from the session, never from the request body
      const profile = await getIdMatch(res.locals.session.session.userId)
      if (!profile) return fail('No profile for this account')

      let thumbnail_link: string | null = null
      if (thumb) {
        const out = await toWebp(thumb.path, 1280)
        created.push(out)
        thumbnail_link = `/images/${path.basename(out)}`
      }

      const video_link = `/video/${video.filename}`
      const id = await newVideo({
        name,
        description: text(req.body.description, MAX_DESCRIPTION),
        author_id: profile.id,
        video_link,
        thumbnail_link,
      })

      return res.status(201).json({ id, video_link, thumbnail_link })
    } catch (err) {
      console.error('video upload failed:', err)
      await cleanup(created)
      next(err)
    }
  },
)

router.post('/song', makeUpload(['audio', 'cover']), async (req, res, next) => {
  const files = req.files as Files
  const audio = files.audio?.[0]
  const cover = files.cover?.[0]
  const created = allFiles(req).map((f) => f.path)

  const fail = async (message: string) => {
    await cleanup(created)
    return res.status(400).json({ message })
  }

  try {
    if (!audio) return fail('No audio uploaded')
    const name = text(req.body.name, MAX_NAME)
    if (!name) return fail('Name is required')
    const runtime = validRuntime(req.body.runtime)
    if (!runtime) return fail('Could not read the song length')

    const profile = await getIdMatch(res.locals.session.session.userId)
    if (!profile) return fail('No profile for this account')

    // Optional: upload straight into one of the uploader's albums
    let album_id: number | null = null
    let track_number: number | null = null
    if (req.body.album_id) {
      const album = await getAlbumRow(Number(req.body.album_id))
      if (!album || album.author_id !== Number(profile.id))
        return fail('Album not found')
      album_id = album.id
      track_number = await nextTrackNumber(album.id)
    }

    let coverUrl: string | null = null
    if (cover) {
      const out = await toWebp(cover.path, 600)
      created.push(out)
      coverUrl = `/images/${path.basename(out)}`
    }

    const sessionUser = res.locals.session.user
    const author =
      text(req.body.author, MAX_NAME) ||
      sessionUser.username ||
      sessionUser.name

    const url = `/audio/${audio.filename}`
    const id = await newSong({
      name,
      author,
      author_id: profile.id,
      url,
      runtime,
      cover: coverUrl,
      album_id,
      track_number,
    })

    return res.status(201).json({ id, url, cover: coverUrl })
  } catch (err) {
    console.error('song upload failed:', err)
    await cleanup(created)
    next(err)
  }
})

// ---------- posts ----------

const MAX_POST_IMAGES = 10
const MAX_TITLE = 120
const MAX_POST_BODY = 5000

router.post(
  '/post',
  makeUpload(['images'], { images: MAX_POST_IMAGES }),
  async (req, res, next) => {
    const images = (req.files as Files).images ?? []
    const created = allFiles(req).map((f) => f.path)

    const fail = async (message: string) => {
      await cleanup(created)
      return res.status(400).json({ message })
    }

    try {
      const title = text(req.body.title, MAX_TITLE)
      const body = text(req.body.body, MAX_POST_BODY)
      if (!title && !body && images.length === 0)
        return fail('A post needs a title, text or an image')

      const profile = await getIdMatch(res.locals.session.session.userId)
      if (!profile) return fail('No profile for this account')

      // Convert sequentially so a big batch does not spike memory
      const urls: string[] = []
      for (const img of images) {
        const out = await toWebp(img.path, 1600)
        created.push(out)
        urls.push(`/images/${path.basename(out)}`)
      }

      const id = await newPost({
        title,
        the_post: body,
        author_id: profile.id,
        images: urls,
      })

      return res.status(201).json({ id, images: urls })
    } catch (err) {
      console.error('post upload failed:', err)
      await cleanup(created)
      next(err)
    }
  },
)

export default router
