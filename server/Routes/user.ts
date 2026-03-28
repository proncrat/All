import express from 'express'
import {
  getAllUsers,
  getDescriptionByUser,
  getPhotosByUser,
  getPostsByUser,
  getProfile,
  getSongsByUser,
  getVideosByUser,
} from '../database'
const router = express.Router()

//For users obv
//Test function would it ever be usefull?? who knows
router.get('/', async (req, res, next) => {
  try {
    const data = await getAllUsers()
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
    const userId = req.params.id
    const data = await getProfile(userId)
    if (data == null) {
      return res.status(404).send('Nothing there')
    }
    res.json(data)
  } catch (err) {
    next(err)
  }
})

router.get('/:id/photos', async (req, res, next) => {
  try {
    const userId = req.params.id
    const data = await getPhotosByUser(userId)
    if (data == null) {
      return res.status(404).send('Nothing there')
    }
    res.json(data)
  } catch (err) {
    next(err)
  }
})

router.get('/:id/posts', async (req, res, next) => {
  try {
    const userId = req.params.id
    const data = await getPostsByUser(userId)
    if (data == null) {
      return res.status(404).send('Nothing there')
    }
    res.json(data)
  } catch (err) {
    next(err)
  }
})

router.get('/:id/videos', async (req, res, next) => {
  try {
    const userId = req.params.id
    const data = await getVideosByUser(userId)
    if (data == null) {
      return res.status(404).send('Nothing there')
    }
    res.json(data)
  } catch (err) {
    next(err)
  }
})

router.get('/:id/songs', async (req, res, next) => {
  try {
    const userId = req.params.id
    const data = await getSongsByUser(userId)
    if (data == null) {
      return res.status(404).send('Nothing there')
    }
    res.json(data)
  } catch (err) {
    next(err)
  }
})

router.get('/:id/description', async (req, res, next) => {
  try {
    const userId = req.params.id
    const data = await getDescriptionByUser(userId)
    if (data == null) {
      return res.status(404).send('Nothing there')
    }
    res.json(data)
  } catch (err) {
    next(err)
  }
})

router.get('/:id/check', async (req, res, next) => {
  try {
    const userId = req.params.id
    const data = await getDescriptionByUser(userId)
    if (data == null) {
      res.json({ valid: false })
    }
    res.json({ valid: true })
  } catch (err) {
    next(err)
  }
})

export default router
