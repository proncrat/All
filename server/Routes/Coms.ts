import express from 'express'
import { getmessages } from '../database'

const router = express.Router()

//For users obv
//Test function would it ever be usefull?? who knows

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

export default router
