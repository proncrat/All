import express from 'express'
const router = express.Router()

import multer from 'multer'
import path from 'path'
import { newPhoto, getIdMatch, newmessage } from '../database'

import { authMiddleware } from '../middleware/enpointauth'

router.use(authMiddleware)

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images') // Set destination folder
  },
  filename: function (req, file, cb) {
    const uniqueId = crypto.randomUUID() // Generate unique filename
    cb(null, uniqueId + path.extname(file.originalname))
  },
})

const upload = multer({ storage: storage })

router.post('/', upload.single('image'), async (req, res, next) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded')
  }
  try {
    const photoData = req.body
    photoData.url = `/images/${req.file.filename}`
    photoData.thumburl = `/images/${req.file.filename}`
    const msgdata = JSON.parse(photoData.msgdata)
    if (msgdata) {
      const linkmatch = res.locals.session.session.userId
      try {
        const userId = await getLinkId(linkmatch)
        if (!userId) {
          return res.status(400).send('Invalid login credentials')
        }
        const message = msgdata
        message.senderid = userId.id
        message.send_date = new Date()
        message.text = photoData.url
        console.log(message)
        await newmessage(message)
        return res.status(200).send('Nothing there')
      } catch (err) {
        next(err)
      }
    } else {
      delete photoData.msgdata
      await newPhoto(photoData)
      return res.status(204).send('Success')
    }
  } catch (err) {
    return res.status(500).send('failed to add database reference')
  }
})

async function getLinkId(authUserId: string) {
  try {
    const userId = await getIdMatch(authUserId)
    return userId
  } catch (error) {
    throw new Error('link id error')
  }
}

export default router
