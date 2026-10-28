import express from 'express'
import {
  deletePhoto,
  getAllPhotos,
  getPhotoById,
  getPhotoByUserId,
  getPhotosByUser,
} from '../database'
import { getLinkId } from './imguploadtest'
import { authMiddlewarenoerror } from '../middleware/enpointauth'
const router = express.Router()

//For users obv
//Test function would it ever be usefull?? who knows
router.get('/', async (req, res, next) => {
  try {
    const data = await getAllPhotos()
    if (data == null) {
      return res.status(404).send('Nothing there')
    }
    res.json(data)
  } catch (err) {
    next(err)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const videoId = req.params.id
    const data = await getPhotosByUser(videoId)
    if (data == null) {
      return res.status(404).send('Nothing there')
    }
    res.json(data)
  } catch (err) {
    next(err)
  }
})

const DEFAULT_LIMIT = 30
const MAX_LIMIT = 100

// 1. Encode: Replace unsafe characters and trim padding
function encodeCursor(cursor: Cursor): string {
  const jsonString = JSON.stringify(cursor)
  return Buffer.from(jsonString)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

// 2. Decode: Restore standard Base64 characters before decoding
function decodeCursor(encoded: string): Cursor | null {
  try {
    // Restore standard base64 characters
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/')
    // Pad with '=' if necessary
    while (base64.length % 4) {
      base64 += '='
    }
    const jsonString = Buffer.from(base64, 'base64').toString('utf8')
    return JSON.parse(jsonString) as Cursor
  } catch {
    return null // Returns null safely instead of crashing
  }
}

// GET /api/users/:id/photos?limit=30&cursor=eyJ0Ijoi...
router.get('/improv/:id', async (req, res, next) => {
  try {
    const userId = req.params.id

    // limit: default 30, clamped to 1..MAX_LIMIT
    const parsedLimit = Number.parseInt(String(req.query.limit ?? ''), 10)
    const limit = Number.isNaN(parsedLimit)
      ? DEFAULT_LIMIT
      : Math.min(Math.max(parsedLimit, 1), MAX_LIMIT)

    // cursor: optional, omitted on the first request
    let cursor: Cursor | null = null
    if (typeof req.query.cursor === 'string' && req.query.cursor !== '') {
      cursor = decodeCursor(req.query.cursor)
      if (!cursor) {
        return res.status(400).json({ error: 'Invalid cursor' })
      }
    }

    const { items, nextCursor } = await getPhotoByUserId(userId, limit, cursor)

    res.json({
      items,
      nextCursor: nextCursor ? encodeCursor(nextCursor) : null,
    })
  } catch (err) {
    next(err)
  }
})

router.use(authMiddlewarenoerror)

//only removes the db entry btw
router.delete('/', async (req, res, next) => {
  try {
    const user = await getLinkId(res.locals.session.session.userId)
    if (!user) {
      return res.status(400).send('Invalid login credentials')
    }

    const data = req.body
    const photo = await getPhotoById(data.id)

    if (data == null) {
      return res.status(404).send('No photo id')
    }

    if (photo.author_id == user.id) {
      await deletePhoto(data.id)
      return res.status(200).send('Succesfully deleted')
    }
  } catch (err) {
    next(err)
  }
})

export default router
