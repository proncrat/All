import express from 'express'
import { getAllVideos, getVideoById, getVideosByUser } from '../database'
const router = express.Router()

//For users obv
//Test function would it ever be usefull?? who knows
router.get('/', async (req, res, next) => {
  try {
    const data = await getAllVideos()
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
    const data = await getVideoById(videoId)
    if (data == null) {
      return res.status(404).send('Nothing there')
    }
    res.json(data)
  } catch (err) {
    next(err)
  }
})

export default router
