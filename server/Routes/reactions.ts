import express from 'express'
import {
  getIdMatch,
  getLibrary,
  getProfileReposts,
  getReactionSummary,
  getUserReactions,
  reactionTargetExists,
  REACTION_TARGETS,
  setReactionFlag,
  setVote,
  type FlagKind,
  type ReactionTarget,
} from '../database'
import {
  authMiddleware,
  authMiddlewarenoerror,
} from '../middleware/enpointauth'

const router = express.Router()

// GET    /api/v1/reactions/:type/:id          counts + the viewer's own state
// PUT    /api/v1/reactions/:type/:id/vote     { vote: 'like' | 'dislike' | null }
// PUT    /api/v1/reactions/:type/:id/save     { active: boolean }
// PUT    /api/v1/reactions/:type/:id/repost   { active: boolean }
// GET    /api/v1/reactions/me/:kind?type=...  the viewer's likes/dislikes/saves/reposts
// GET    /api/v1/reactions/library            all four lists with card details
// GET    /api/v1/reactions/user/:profileId/reposts?type=...  a profile's reposts (public)
//
// :type is one of video | post | photo | song

const KINDS = ['like', 'dislike', 'save', 'repost'] as const

function isTarget(value: unknown): value is ReactionTarget {
  return typeof value === 'string' && value in REACTION_TARGETS
}

/** Profile id of the signed-in user, or null. */
async function viewerId(res: express.Response): Promise<number | null> {
  const authId = res.locals.session?.session?.userId
  if (!authId) return null
  const profile = await getIdMatch(authId)
  return profile?.id ?? null
}

/** Validates :type and :id and that the target exists; responds on failure. */
async function parseTarget(req: express.Request, res: express.Response) {
  const { type } = req.params
  const id = Number(req.params.id)
  if (!isTarget(type) || !Number.isInteger(id) || id <= 0) {
    res.status(400).json({ message: 'Invalid target' })
    return null
  }
  if (!(await reactionTargetExists(type, id))) {
    res.status(404).json({ message: 'Not found' })
    return null
  }
  return { type, id }
}

router.get('/library', authMiddleware, async (req, res, next) => {
  try {
    const userId = await viewerId(res)
    if (!userId) return res.status(400).json({ message: 'No profile' })
    res.json(await getLibrary(userId))
  } catch (err) {
    next(err)
  }
})

router.get('/user/:profileId/reposts', async (req, res, next) => {
  try {
    const profileId = Number(req.params.profileId)
    const type = req.query.type
    if (!Number.isInteger(profileId) || profileId <= 0) {
      return res.status(400).json({ message: 'Invalid profile' })
    }
    if (type !== undefined && !isTarget(type)) {
      return res.status(400).json({ message: 'Invalid type' })
    }
    res.json(await getProfileReposts(profileId, type))
  } catch (err) {
    next(err)
  }
})

router.get('/me/:kind', authMiddleware, async (req, res, next) => {
  try {
    const kind = req.params.kind as (typeof KINDS)[number]
    const type = req.query.type
    if (!KINDS.includes(kind)) {
      return res.status(400).json({ message: 'Invalid kind' })
    }
    if (type !== undefined && !isTarget(type)) {
      return res.status(400).json({ message: 'Invalid type' })
    }
    const userId = await viewerId(res)
    if (!userId) return res.status(400).json({ message: 'No profile' })
    res.json(await getUserReactions(userId, kind, type))
  } catch (err) {
    next(err)
  }
})

router.get('/:type/:id', authMiddlewarenoerror, async (req, res, next) => {
  try {
    const target = await parseTarget(req, res)
    if (!target) return
    res.json(
      await getReactionSummary(target.type, target.id, await viewerId(res)),
    )
  } catch (err) {
    next(err)
  }
})

router.put('/:type/:id/vote', authMiddleware, async (req, res, next) => {
  try {
    const target = await parseTarget(req, res)
    if (!target) return
    const { vote } = req.body ?? {}
    if (vote !== 'like' && vote !== 'dislike' && vote !== null) {
      return res
        .status(400)
        .json({ message: "vote must be 'like', 'dislike' or null" })
    }
    const userId = await viewerId(res)
    if (!userId) return res.status(400).json({ message: 'No profile' })

    await setVote(userId, target.type, target.id, vote)
    res.json(await getReactionSummary(target.type, target.id, userId))
  } catch (err) {
    next(err)
  }
})

function flagRoute(kind: FlagKind): express.RequestHandler {
  return async (req, res, next) => {
    try {
      const target = await parseTarget(req, res)
      if (!target) return
      const { active } = req.body ?? {}
      if (typeof active !== 'boolean') {
        return res.status(400).json({ message: 'active must be a boolean' })
      }
      const userId = await viewerId(res)
      if (!userId) return res.status(400).json({ message: 'No profile' })

      await setReactionFlag(userId, target.type, target.id, kind, active)
      res.json(await getReactionSummary(target.type, target.id, userId))
    } catch (err) {
      next(err)
    }
  }
}

router.put('/:type/:id/save', authMiddleware, flagRoute('save'))
router.put('/:type/:id/repost', authMiddleware, flagRoute('repost'))

export default router
