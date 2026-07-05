import express from 'express'
import {
  getchats,
  getIdMatch,
  getmessages,
  newchat,
  newmessage,
} from '../database'
import { authMiddleware } from '../middleware/enpointauth'

const router = express.Router()

async function getLinkId(authUserId: string) {
  try {
    const userId = await getIdMatch(authUserId)
    return userId
  } catch (error) {
    throw new Error('link id error')
  }
}

router.use(authMiddleware)

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

router.post('/chat', async (req, res, next) => {
  try {
    const data = req.body
    await newchat(data)
    return res.status(204).send('Nothing there')
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

//pretty alright
router.post('/', async (req, res, next) => {
  const linkmatch = res.locals.session.session.userId
  try {
    const userId = await getLinkId(linkmatch)
    if (!userId) {
      return res.status(400).send('Invalid login credentials')
    }
    const message = req.body
    message.senderid = userId.id
    message.send_date = new Date()
    console.log(message)
    await newmessage(message)
    return res.status(200).send('Nothing there')
  } catch (err) {
    next(err)
  }
})

export default router
