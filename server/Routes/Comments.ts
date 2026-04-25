import express from 'express'
import { getCommentsByLink, newCommentByLink } from '../database'
const router = express.Router()

//profile link test url
//http://localhost:3000/api/v1/comments?linkid=1&linktype=profile

router.get('/', async (req, res, next) => {
  try {
    const linkId = req.query.linkid
    const linkType = req.query.linktype

    const data = await getCommentsByLink(linkId, linkType)
    if (data == null) {
      return res.status(204).send('Nothing there')
    }
    res.json(data)
  } catch (err) {
    next(err)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const comment = req.body
    await newCommentByLink(comment)
    //const data = await getCommentsByLink(linkId, linkType)
    //if (data == null) {
    return res.status(204).send('Nothing there')
    //}
    //res.json(data)
  } catch (err) {
    next(err)
  }
})

export default router
