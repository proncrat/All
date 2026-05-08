import express from 'express'
const router = express.Router()

import multer from 'multer'
import path from 'path'

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

router.post('/', upload.single('image'), (req, res) => {
  // The file information is available in req.file
  res.send('File uploaded successfully')
})

export default router
