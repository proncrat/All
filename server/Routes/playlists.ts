import express from 'express'
import {
  addPlaylistItem,
  createPlaylist,
  deletePlaylist,
  getIdMatch,
  getPlaylist,
  getPlaylistIdsContaining,
  getPlaylistRow,
  getPlaylistsByOwner,
  reactionTargetExists,
  REACTION_TARGETS,
  removePlaylistItem,
  updatePlaylist,
  type PlaylistRow,
  type ReactionTarget,
} from '../database'
import {
  authMiddleware,
  authMiddlewarenoerror,
} from '../middleware/enpointauth'

const router = express.Router()

// GET    /api/v1/playlists/me?type=...                 the viewer's playlists (incl. private)
// GET    /api/v1/playlists/containing/:type/:targetId  ids of the viewer's playlists holding an item
// GET    /api/v1/playlists/user/:profileId             a user's playlists (private ones only for the owner)
// GET    /api/v1/playlists/:id                         one playlist with its items
// POST   /api/v1/playlists                             { title, type, description?, is_private? }
// PUT    /api/v1/playlists/:id                         { title?, description?, is_private? }
// DELETE /api/v1/playlists/:id
// POST   /api/v1/playlists/:id/items                   { target_id }
// DELETE /api/v1/playlists/:id/items/:targetId
//
// type is one of video | song | post | photo

const MAX_TITLE = 100
const MAX_DESCRIPTION = 1000

function isTarget(value: unknown): value is ReactionTarget {
  return typeof value === 'string' && value in REACTION_TARGETS
}

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
async function ownedPlaylist(
  req: express.Request,
  res: express.Response,
): Promise<{ playlist: PlaylistRow; userId: number } | null> {
  const id = toId(req.params.id)
  if (!id) {
    res.status(400).json({ message: 'Invalid playlist id' })
    return null
  }
  const userId = await viewerId(res)
  if (!userId) {
    res.status(400).json({ message: 'No profile' })
    return null
  }
  const playlist = await getPlaylistRow(id)
  if (!playlist) {
    res.status(404).json({ message: 'Not found' })
    return null
  }
  if (playlist.owner_id !== userId) {
    res.status(403).json({ message: 'Not your playlist' })
    return null
  }
  return { playlist, userId }
}

/** Validates title/description/is_private from a body. */
function parseFields(body: Record<string, unknown>, requireTitle: boolean) {
  const out: {
    title?: string
    description?: string | null
    is_private?: boolean
  } = {}
  if (body.title !== undefined || requireTitle) {
    if (typeof body.title !== 'string' || !body.title.trim())
      return { error: 'title is required' }
    if (body.title.trim().length > MAX_TITLE)
      return { error: `title must be at most ${MAX_TITLE} characters` }
    out.title = body.title.trim()
  }
  if (body.description !== undefined) {
    if (body.description !== null && typeof body.description !== 'string')
      return { error: 'description must be a string' }
    const d = (body.description as string | null)?.trim() || null
    if (d && d.length > MAX_DESCRIPTION)
      return {
        error: `description must be at most ${MAX_DESCRIPTION} characters`,
      }
    out.description = d
  }
  if (body.is_private !== undefined) {
    if (typeof body.is_private !== 'boolean')
      return { error: 'is_private must be a boolean' }
    out.is_private = body.is_private
  }
  return { fields: out }
}

router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const type = req.query.type
    if (type !== undefined && !isTarget(type))
      return res.status(400).json({ message: 'Invalid type' })
    const userId = await viewerId(res)
    if (!userId) return res.status(400).json({ message: 'No profile' })
    res.json(await getPlaylistsByOwner(userId, { includePrivate: true, type }))
  } catch (err) {
    next(err)
  }
})

router.get(
  '/containing/:type/:targetId',
  authMiddleware,
  async (req, res, next) => {
    try {
      const { type } = req.params
      const targetId = toId(req.params.targetId)
      if (!isTarget(type) || !targetId)
        return res.status(400).json({ message: 'Invalid target' })
      const userId = await viewerId(res)
      if (!userId) return res.status(400).json({ message: 'No profile' })
      res.json(await getPlaylistIdsContaining(userId, type, targetId))
    } catch (err) {
      next(err)
    }
  },
)

router.get(
  '/user/:profileId',
  authMiddlewarenoerror,
  async (req, res, next) => {
    try {
      const profileId = toId(req.params.profileId)
      if (!profileId)
        return res.status(400).json({ message: 'Invalid user id' })
      const userId = await viewerId(res)
      res.json(
        await getPlaylistsByOwner(profileId, {
          includePrivate: userId === profileId,
        }),
      )
    } catch (err) {
      next(err)
    }
  },
)

router.get('/:id', authMiddlewarenoerror, async (req, res, next) => {
  try {
    const id = toId(req.params.id)
    if (!id) return res.status(400).json({ message: 'Invalid playlist id' })
    const playlist = await getPlaylist(id)
    const isOwner = playlist?.owner_id === (await viewerId(res))
    // Private playlists look like they don't exist to anyone but the owner
    if (!playlist || (playlist.is_private && !isOwner))
      return res.status(404).json({ message: 'Not found' })
    res.json({ ...playlist, is_owner: isOwner })
  } catch (err) {
    next(err)
  }
})

router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const body = req.body ?? {}
    if (!isTarget(body.type))
      return res
        .status(400)
        .json({ message: 'type must be video, song, post or photo' })
    const parsed = parseFields(body, true)
    if (parsed.error) return res.status(400).json({ message: parsed.error })

    const userId = await viewerId(res)
    if (!userId) return res.status(400).json({ message: 'No profile' })

    const id = await createPlaylist({
      ...parsed.fields,
      title: parsed.fields!.title!,
      owner_id: userId,
      type: body.type,
    })
    res.status(201).json({ ...(await getPlaylist(id)), is_owner: true })
  } catch (err) {
    next(err)
  }
})

router.put('/:id', authMiddleware, async (req, res, next) => {
  try {
    const owned = await ownedPlaylist(req, res)
    if (!owned) return
    const parsed = parseFields(req.body ?? {}, false)
    if (parsed.error) return res.status(400).json({ message: parsed.error })
    await updatePlaylist(owned.playlist.id, parsed.fields!)
    res.json({ ...(await getPlaylist(owned.playlist.id)), is_owner: true })
  } catch (err) {
    next(err)
  }
})

router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const owned = await ownedPlaylist(req, res)
    if (!owned) return
    await deletePlaylist(owned.playlist.id)
    res.sendStatus(204)
  } catch (err) {
    next(err)
  }
})

router.post('/:id/items', authMiddleware, async (req, res, next) => {
  try {
    const owned = await ownedPlaylist(req, res)
    if (!owned) return
    const targetId = toId(req.body?.target_id)
    if (!targetId) return res.status(400).json({ message: 'Invalid target_id' })
    if (!(await reactionTargetExists(owned.playlist.type, targetId)))
      return res.status(404).json({ message: 'Item not found' })
    await addPlaylistItem(owned.playlist.id, targetId)
    res.json({ ...(await getPlaylist(owned.playlist.id)), is_owner: true })
  } catch (err) {
    next(err)
  }
})

router.delete(
  '/:id/items/:targetId',
  authMiddleware,
  async (req, res, next) => {
    try {
      const owned = await ownedPlaylist(req, res)
      if (!owned) return
      const targetId = toId(req.params.targetId)
      if (!targetId)
        return res.status(400).json({ message: 'Invalid target id' })
      await removePlaylistItem(owned.playlist.id, targetId)
      res.json({ ...(await getPlaylist(owned.playlist.id)), is_owner: true })
    } catch (err) {
      next(err)
    }
  },
)

export default router
