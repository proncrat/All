import express from 'express'
import path from 'path'
import {
  countSongsOwnedBy,
  createAlbum,
  deleteAlbum,
  getAlbum,
  getAlbumRow,
  getAlbumsByUser,
  getIdMatch,
  setAlbumTracks,
  updateAlbum,
  type AlbumFields,
  type AlbumRow,
} from '../database'
import {
  authMiddleware,
  authMiddlewarenoerror,
} from '../middleware/enpointauth'
import {
  allFiles,
  cleanup,
  makeUpload,
  text,
  toWebp,
  type Files,
} from './mediaupload'

const router = express.Router()

// GET    /api/v1/albums/user/:profileId   a user's albums
// GET    /api/v1/albums/:id               one album with its tracks in order
// POST   /api/v1/albums                   multipart: title, description?, release_date?, cover?
// PUT    /api/v1/albums/:id               multipart: title?, description?, release_date?, cover?, remove_cover?
// DELETE /api/v1/albums/:id               its songs become singles
// PUT    /api/v1/albums/:id/tracks        { song_ids: number[] }  the full tracklist, in order

const MAX_TITLE = 200
const MAX_DESCRIPTION = 2000
const COVER_WIDTH = 600

const toId = (value: unknown) => {
  const n = Number(value)
  return Number.isInteger(n) && n > 0 ? n : null
}

/** Profile id of the signed-in user, or null. */
async function viewerId(res: express.Response): Promise<number | null> {
  const authId = res.locals.session?.session?.userId
  if (!authId) return null
  const profile = await getIdMatch(authId)
  return profile?.id ? Number(profile.id) : null
}

/** Loads :id and checks the viewer owns it; responds on failure. */
async function ownedAlbum(
  req: express.Request,
  res: express.Response,
): Promise<AlbumRow | null> {
  const id = toId(req.params.id)
  if (!id) {
    res.status(400).json({ message: 'Invalid album id' })
    return null
  }
  const [userId, album] = await Promise.all([viewerId(res), getAlbumRow(id)])
  if (!album) {
    res.status(404).json({ message: 'Not found' })
    return null
  }
  if (album.author_id !== userId) {
    res.status(403).json({ message: 'Not your album' })
    return null
  }
  return album
}

/** Validates title/description/release_date from a (multipart) body. */
function parseFields(
  body: Record<string, unknown>,
  requireTitle: boolean,
): { error: string } | { fields: AlbumFields } {
  const out: AlbumFields = {}
  if (body.title !== undefined || requireTitle) {
    const title = text(body.title, MAX_TITLE + 1)
    if (!title) return { error: 'Title is required' }
    if (title.length > MAX_TITLE)
      return { error: `Title must be at most ${MAX_TITLE} characters` }
    out.title = title
  }
  if (body.description !== undefined) {
    const d = text(body.description, MAX_DESCRIPTION + 1)
    if (d.length > MAX_DESCRIPTION)
      return {
        error: `Description must be at most ${MAX_DESCRIPTION} characters`,
      }
    out.description = d || null
  }
  if (body.release_date !== undefined) {
    const d = text(body.release_date, 10)
    if (d && !/^\d{4}-\d{2}-\d{2}$/.test(d))
      return { error: 'Release date must be YYYY-MM-DD' }
    out.release_date = d || null
  }
  return { fields: out }
}

/** Converts an uploaded cover to webp; returns its public url, or null. */
async function saveCover(req: express.Request, created: string[]) {
  const cover = (req.files as Files | undefined)?.cover?.[0]
  if (!cover) return null
  const out = await toWebp(cover.path, COVER_WIDTH)
  created.push(out)
  return `/images/${path.basename(out)}`
}

router.get('/user/:profileId', async (req, res, next) => {
  try {
    const profileId = toId(req.params.profileId)
    if (!profileId) return res.status(400).json({ message: 'Invalid user id' })
    res.json(await getAlbumsByUser(profileId))
  } catch (err) {
    next(err)
  }
})

router.get('/:id', authMiddlewarenoerror, async (req, res, next) => {
  try {
    const id = toId(req.params.id)
    if (!id) return res.status(400).json({ message: 'Invalid album id' })
    const album = await getAlbum(id)
    if (!album) return res.status(404).json({ message: 'Not found' })
    res.json({ ...album, is_owner: album.author_id === (await viewerId(res)) })
  } catch (err) {
    next(err)
  }
})

router.post(
  '/',
  authMiddleware,
  makeUpload(['cover']),
  async (req, res, next) => {
    const created = allFiles(req).map((f) => f.path)
    try {
      const parsed = parseFields(req.body ?? {}, true)
      if ('error' in parsed) {
        await cleanup(created)
        return res.status(400).json({ message: parsed.error })
      }
      const userId = await viewerId(res)
      if (!userId) {
        await cleanup(created)
        return res.status(400).json({ message: 'No profile' })
      }
      const cover = await saveCover(req, created)
      const id = await createAlbum({
        ...parsed.fields,
        title: parsed.fields.title!,
        cover,
        author_id: userId,
      })
      res.status(201).json({ ...(await getAlbum(id)), is_owner: true })
    } catch (err) {
      await cleanup(created)
      next(err)
    }
  },
)

router.put(
  '/:id',
  authMiddleware,
  makeUpload(['cover']),
  async (req, res, next) => {
    const created = allFiles(req).map((f) => f.path)
    try {
      const album = await ownedAlbum(req, res)
      if (!album) return cleanup(created)
      const parsed = parseFields(req.body ?? {}, false)
      if ('error' in parsed) {
        await cleanup(created)
        return res.status(400).json({ message: parsed.error })
      }
      const fields = parsed.fields
      const cover = await saveCover(req, created)
      if (cover) fields.cover = cover
      else if (String(req.body?.remove_cover) === 'true') fields.cover = null
      await updateAlbum(album.id, fields)
      res.json({ ...(await getAlbum(album.id)), is_owner: true })
    } catch (err) {
      await cleanup(created)
      next(err)
    }
  },
)

router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const album = await ownedAlbum(req, res)
    if (!album) return
    await deleteAlbum(album.id)
    res.sendStatus(204)
  } catch (err) {
    next(err)
  }
})

router.put('/:id/tracks', authMiddleware, async (req, res, next) => {
  try {
    const album = await ownedAlbum(req, res)
    if (!album) return
    const raw = req.body?.song_ids
    if (!Array.isArray(raw))
      return res.status(400).json({ message: 'song_ids must be an array' })
    const songIds = raw.map(toId)
    if (
      songIds.some((id) => id === null) ||
      new Set(songIds).size !== songIds.length
    )
      return res.status(400).json({ message: 'Invalid song_ids' })
    const ids = songIds as number[]
    if ((await countSongsOwnedBy(album.author_id, ids)) !== ids.length)
      return res
        .status(403)
        .json({ message: 'You can only add your own songs to an album' })
    await setAlbumTracks(album.id, ids)
    res.json({ ...(await getAlbum(album.id)), is_owner: true })
  } catch (err) {
    next(err)
  }
})

export default router
