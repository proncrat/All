import express from 'express'
import { getAllPosts, getPostById } from '../database'
const router = express.Router()

//For users obv
//Test function would it ever be usefull?? who knows
router.get('/', async (req, res, next) => {
  try {
    const data = await getAllPosts()
    if (data == null) {
      return res.status(404).send('Nothing there')
    }
    res.json(data)
  } catch (err) {
    next(err)
  }
})

// A single post with its images and author (posts by a user are at
// /api/v1/profile/:id/posts). Creating posts is POST /api/v1/upload/post.
router.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id)) return res.status(400).send('Bad id')
    const data = await getPostById(id)
    if (data == null) {
      return res.status(404).send('Nothing there')
    }
    res.json(data)
  } catch (err) {
    next(err)
  }
})

export default router
