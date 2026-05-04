import express from 'express'
import { getchats, getmessages, newmessage } from '../database'

const router = express.Router()

//For users obv
//Test function would it ever be usefull?? who knows

router.get('/chats/:id', async (req, res, next) => {
  try {
    const userid = req.params.id
    const data = await getchats(userid)
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
    const chatId = req.params.id
    const data = await getmessages(chatId)
    if (data == null) {
      return res.status(404).send('Nothing there')
    }
    res.json(data)
  } catch (err) {
    next(err)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const message = req.body
    await newmessage(message)
    return res.status(204).send('Nothing there')
    //}
    //res.json(data)
  } catch (err) {
    next(err)
  }
})

export default router
