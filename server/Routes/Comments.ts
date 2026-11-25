import express from 'express'
import {
  deleteCommentById,
  getCommentById,
  getCommentsByLink,
  getIdMatch,
  newCommentByLink,
  setVote,
} from '../database'
import {
  authMiddleware,
  authMiddlewarenoerror,
} from '../middleware/enpointauth'

const router = express.Router()

// GET    /api/v1/comments?linkid=1&linktype=profile   comments + replies, with votes
// POST   /api/v1/comments          { link_type, link_id, body_text, parent_id? }
// PUT    /api/v1/comments/:id/vote { vote: 'like' | 'dislike' | null }
// DELETE /api/v1/comments/:id      only the comment's author

/** Profile id of the signed-in user, or null. */
async function viewerId(res: express.Response): Promise<number | null> {
  const authId = res.locals.session?.session?.userId
  if (!authId) return null
  const profile = await getIdMatch(authId)
  return profile?.id ?? null
}

router.get('/', authMiddlewarenoerror, async (req, res, next) => {
  try {
    const linkId = String(req.query.linkid ?? '')
    const linkType = String(req.query.linktype ?? '')
    if (!linkId || !linkType) {
      return res.status(400).json({ message: 'linkid and linktype required' })
    }
    res.json(await getCommentsByLink(linkId, linkType, await viewerId(res)))
  } catch (err) {
    next(err)
  }
})

router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const authorId = await viewerId(res)
    if (!authorId) return res.status(400).json({ message: 'No profile' })

    const { link_type, link_id, body_text, parent_id } = req.body ?? {}
    const text = typeof body_text === 'string' ? body_text.trim() : ''
    if (!link_type || link_id == null || !text) {
      return res.status(400).json({ message: 'Missing comment fields' })
    }

    // Replies always hang off a top-level comment on the same target
    let parentId: number | null = null
    if (parent_id != null) {
      const parent = await getCommentById(Number(parent_id))
      if (
        !parent ||
        parent.link_type !== link_type ||
        String(parent.link_id) !== String(link_id)
      ) {
        return res.status(400).json({ message: 'Invalid parent comment' })
      }
      parentId = Number(parent.parent_id ?? parent.id)
    }

    await newCommentByLink({
      link_type,
      link_id,
      author_id: authorId,
      body_text: text,
      parent_id: parentId,
    })
    res.status(201).json({ message: 'Created' })
  } catch (err) {
    next(err)
  }
})

router.put('/:id/vote', authMiddleware, async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    const { vote } = req.body ?? {}
    if (vote !== 'like' && vote !== 'dislike' && vote !== null) {
      return res
        .status(400)
        .json({ message: "vote must be 'like', 'dislike' or null" })
    }
    if (!Number.isInteger(id) || !(await getCommentById(id))) {
      return res.status(404).json({ message: 'Comment not found' })
    }
    const userId = await viewerId(res)
    if (!userId) return res.status(400).json({ message: 'No profile' })

    await setVote(userId, 'comment', id, vote)
    res.status(204).end()
  } catch (err) {
    next(err)
  }
})

router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    const comment = Number.isInteger(id) ? await getCommentById(id) : null
    if (!comment) return res.status(404).json({ message: 'Comment not found' })

    const userId = await viewerId(res)
    // author_id can come back as a string (SQLite column affinity), so compare as numbers
    if (!userId || Number(userId) !== Number(comment.author_id)) {
      return res.status(403).json({ message: 'Not your comment' })
    }

    await deleteCommentById(id)
    res.status(204).end()
  } catch (err) {
    next(err)
  }
})

export default router
