import express from 'express'
import {
  getAllUsers,
  getDescriptionByUser,
  getIdMatch,
  getPhotosByUser,
  getProfileHome,
  getPostsByUser,
  getProfile,
  getSongsByUser,
  getVideosByUser,
} from '../database'
import { authMiddlewarenoerror } from '../middleware/enpointauth'

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

// Mixed sample of a user's content for the profile home tab
router.get('/:id/home', authMiddlewarenoerror, async (req, res, next) => {
  try {
    const profileId = Number(req.params.id)
    if (!Number.isInteger(profileId) || profileId <= 0)
      return res.status(400).json({ message: 'Invalid user id' })

    const authId = res.locals.session?.session?.userId
    const viewer = authId ? await getIdMatch(authId) : null
    const includePrivate = Number(viewer?.id) === profileId

    res.json(await getProfileHome(profileId, { includePrivate }))
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

router.get('/:id/shorts', async (req, res, next) => {
  try {
    res.json(await getVideosByUser(req.params.id, true))
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

    if (process.env.NODE_ENV === 'production') {
      res.json(data)
    } else {
      const links = JSON.parse(data.links)
      const return_data = { ...data, links }
      res.json(return_data)
    }
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
