import express from 'express'
import {
  deletePhoto,
  getAllPhotos,
  getPhotoById,
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
