import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs/promises'
import sharp, { type Sharp } from 'sharp'
import { randomUUID } from 'crypto'
import { fromNodeHeaders } from 'better-auth/node'

import { auth } from '../lib/auth'
import { getIdMatch, updateProfile, type ProfileUpdate } from '../database'
import { authMiddleware } from '../middleware/enpointauth'

const router = express.Router()
router.use(authMiddleware)

const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10 MB
const IMAGE_TYPES = /^image\/(jpeg|png|webp|gif)$/

const MAX_NAME = 50
const MAX_DESCRIBE = 200
const MAX_DESCRIPTION = 5000
const MAX_LINKS = 10
const MAX_LINK_FIELD = 500

// How each image field is processed before it's stored
const IMAGE_FIELDS = {
  pfp: (img: Sharp) => img.resize(512, 512, { fit: 'cover', position: 'top' }),
  banner: (img: Sharp) =>
    img.resize({ width: 2000, withoutEnlargement: true }),
  bg: (img: Sharp) =>
    img.resize({ width: 2400, withoutEnlargement: true }),
} as const

type ImageField = keyof typeof IMAGE_FIELDS

// ---------- helpers ----------

/** Best-effort file deletion; never throws. */
async function cleanup(paths: string[]) {
  await Promise.all(paths.map((p) => fs.unlink(p).catch(() => {})))
}

/** Converts an uploaded image to webp, removes the original, returns the new path. */
async function processImage(srcPath: string, field: ImageField) {
  const { dir, name } = path.parse(srcPath)
  const outPath = path.join(dir, `${name}.webp`)
  const tmpPath = path.join(dir, `${name}.tmp.webp`)
  await IMAGE_FIELDS[field](sharp(srcPath).rotate()) // rotate = respect EXIF
    .webp({ quality: 80 })
    .toFile(tmpPath)
  await fs.unlink(srcPath).catch(() => {})
  await fs.rename(tmpPath, outPath)
  return outPath
}

function cleanString(value: unknown, max: number): string | undefined {
  if (typeof value !== 'string') return undefined
  return value.trim().slice(0, max)
}

/** Accepts a JSON string of [{ name, link }] and returns a sanitised JSON string. */
function cleanLinks(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  let parsed: unknown
  try {
    parsed = JSON.parse(value)
  } catch {
    return undefined
  }
  if (!Array.isArray(parsed)) return undefined
  const links = parsed
    .filter(
      (l) => l && typeof l.name === 'string' && typeof l.link === 'string',
    )
    .map((l) => ({
      name: l.name.trim().slice(0, MAX_LINK_FIELD),
      link: l.link.trim().slice(0, MAX_LINK_FIELD),
    }))
    .filter((l) => l.name || l.link)
    .slice(0, MAX_LINKS)
  return JSON.stringify(links)
}

// ---------- multer ----------

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, './public/images'),
    filename: (req, file, cb) =>
      cb(null, randomUUID() + path.extname(file.originalname).toLowerCase()),
  }),
  limits: { fileSize: MAX_IMAGE_SIZE },
  fileFilter: (req, file, cb) => cb(null, IMAGE_TYPES.test(file.mimetype)),
}).fields([
  { name: 'pfp', maxCount: 1 },
  { name: 'banner', maxCount: 1 },
  { name: 'bg', maxCount: 1 },
])

const handleUpload: express.RequestHandler = (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).send(err.message)
    }
    next(err)
  })
}

// ---------- routes ----------

// PUT /api/v1/customize  (multipart/form-data)
// text fields: name, describe, description, links (JSON string)
// file fields: pfp, banner, bg
router.put('/', handleUpload, async (req, res, next) => {
  const files = (req.files ?? {}) as Record<
    string,
    Express.Multer.File[] | undefined
  >
  const createdFiles = Object.values(files)
    .flatMap((f) => f ?? [])
    .map((f) => f.path)
  // Converted webp outputs, removed too if anything later fails
  const finalFiles: string[] = []

  try {
    const profile = await getIdMatch(res.locals.session.session.userId)
    if (!profile) {
      await cleanup(createdFiles)
      return res.status(404).send('Profile not found')
    }

    const update: ProfileUpdate = {}

    const name = cleanString(req.body.name, MAX_NAME)
    if (name !== undefined) {
      if (!name) {
        await cleanup(createdFiles)
        return res.status(400).send('Name cannot be empty')
      }
      update.name = name
    }
    const describe = cleanString(req.body.describe, MAX_DESCRIBE)
    if (describe !== undefined) update.describe = describe
    const description = cleanString(req.body.description, MAX_DESCRIPTION)
    if (description !== undefined) update.description = description
    const links = cleanLinks(req.body.links)
    if (links !== undefined) update.links = links

    // Convert each uploaded image; track the final paths for cleanup on failure
    try {
      for (const field of Object.keys(IMAGE_FIELDS) as ImageField[]) {
        const file = files[field]?.[0]
        if (!file) continue
        const outPath = await processImage(file.path, field)
        finalFiles.push(outPath)
        update[field] = `/images/${path.basename(outPath)}`
      }
    } catch {
      await cleanup([...createdFiles, ...finalFiles])
      return res.status(400).send('Could not process image')
    }

    if (Object.keys(update).length === 0) {
      return res.status(400).send('Nothing to update')
    }

    const updated = await updateProfile(profile.id, update)

    // Keep the better-auth user image in sync with the profile picture
    if (update.pfp) {
      await auth.api.updateUser({
        body: { image: update.pfp },
        headers: fromNodeHeaders(req.headers),
      })
    }

    res.json(updated)
  } catch (err) {
    console.error('profile customize failed:', err)
    await cleanup([...createdFiles, ...finalFiles])
    next(err)
  }
})

export default router
