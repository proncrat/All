import express from 'express'
import { getIdMatch } from '../database'

const router = express.Router()

//profile link test url
//http://localhost:3000/api/v1/comments?linkid=1&linktype=profile

router.get('/id', async (req, res, next) => {
  try {
    const linkId = req.query.linkid

    const data = await getIdMatch(linkId)

    if (data == null) {
      return res.status(204).send('Nothing there')
    }
    res.json(data)
  } catch (err) {
    next(err)
  }
})

export default router
