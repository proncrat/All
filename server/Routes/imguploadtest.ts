import express from 'express'
const router = express.Router()

import multer from 'multer'
import path from 'path'
import { newPhoto } from '../database'

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images') // Set destination folder
  },
  filename: function (req, file, cb) {
    // Generate unique filename: fieldname-timestamp.extension
    const uniqueId = crypto.randomUUID()
    cb(null, uniqueId + path.extname(file.originalname))
  },
})

const upload = multer({ storage: storage })

router.post('/', upload.single('image'), async (req, res) => {
  try {
    const photoData = req.body
    photoData.url = `/images/${req.file.filename}`
    photoData.thumburl = `/images/${req.file.filename}`
    await newPhoto(photoData)
    return res.status(204).send('Success')
    //}
    //res.json(data)
  } catch (err) {
    return res.status(500).send('Lowkey dont know')
  }
})

export default router
