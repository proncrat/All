import express from 'express'
import {
  getFollowedById,
  getFollowingById,
  newFollowById,
  unFollowById,
} from '../database'
const router = express.Router()

//The follow system is weird, followed user id is the loged in user,
//following is the person your following. Is this right?
//For the love of god change these naming conventions bro

router.get('/following/:id', async (req, res, next) => {
  try {
    const Id = Number(req.params.id)

    const data = await getFollowedById(Id)
    if (data == null) {
      return res.status(204).send('Nothing there')
    }
    res.json(data)
  } catch (err) {
    next(err)
  }
})

router.get('/follower/:id', async (req, res, next) => {
  try {
    const Id = Number(req.params.id)

    const data = await getFollowingById(Id)
    if (data == null) {
      return res.status(204).send('Nothing there')
    }
    res.json(data)
  } catch (err) {
    next(err)
  }
})

//What even is security lul
router.post('/', async (req, res, next) => {
  try {
    const data = req.body
    await newFollowById(data)
    return res.status(204).send('Nothing there')
  } catch (err) {
    next(err)
  }
})

router.post('/un', async (req, res, next) => {
  try {
    const data = req.body
    await unFollowById(data)
    return res.status(204).send('Their gone now')
  } catch (err) {
    next(err)
  }
})

export default router
