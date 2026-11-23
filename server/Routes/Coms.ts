import express from 'express'
import {
  addChatMembers,
  changeStatus,
  ChatError,
  createChat,
  deleteMessage,
  editMessage,
  getChatMembers,
  getChatsForProfile,
  getIdMatch,
  getmessages,
  isChatMember,
  leaveChat,
  removeChatMember,
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

/** The signed-in user's profile id (sends a 400 and returns null if none). */
async function me(res: express.Response): Promise<number | null> {
  const profile = await getLinkId(res.locals.session.session.userId)
  if (!profile) {
    res.status(400).send('Invalid login credentials')
    return null
  }
  return Number(profile.id)
}

function chatIdParam(req: express.Request) {
  const id = Number(req.params.id)
  return Number.isInteger(id) && id > 0 ? id : null
}

function idList(value: unknown): number[] {
  return Array.isArray(value)
    ? value.map(Number).filter((n) => Number.isInteger(n) && n > 0)
    : []
}

/** Sends ChatErrors as their status + message, everything else to next(). */
function handle(err: unknown, res: express.Response, next: express.NextFunction) {
  if (err instanceof ChatError)
    return res.status(err.status).json({ message: err.message })
  next(err)
}

router.use(authMiddleware)

// ---------- chats ----------
// GET    /coms/chats              chats the signed-in user is in
// POST   /coms/chat               { memberIds: number[], name? } -> { chatid }
// GET    /coms/chat/:id/members   everyone in the chat
// POST   /coms/chat/:id/members   { memberIds } add people you follow
// DELETE /coms/chat/:id           leave ("delete") the chat; messages are kept
// DELETE /coms/chat/:id/members/:profileId  creator removes someone

// `/chats/:id` is kept for old clients; the id is ignored, the session decides
router.get(['/chats', '/chats/:id'], async (req, res, next) => {
  try {
    const profileId = await me(res)
    if (profileId == null) return
    res.json(await getChatsForProfile(profileId))
  } catch (err) {
    next(err)
  }
})

router.post('/chat', async (req, res, next) => {
  try {
    const profileId = await me(res)
    if (profileId == null) return
    // `recieverid` is the old 1:1 shape
    const memberIds = idList(
      req.body.memberIds ?? (req.body.recieverid ? [req.body.recieverid] : []),
    )
    const name = typeof req.body.name === 'string' ? req.body.name : null
    const result = await createChat(profileId, memberIds, name)
    res.status(result.created ? 201 : 200).json(result)
  } catch (err) {
    handle(err, res, next)
  }
})

router.get('/chat/:id/members', async (req, res, next) => {
  try {
    const profileId = await me(res)
    if (profileId == null) return
    const chatId = chatIdParam(req)
    if (!chatId) return res.status(400).send('Bad chat id')
    if (!(await isChatMember(chatId, profileId)))
      return res.status(403).json({ message: 'You are not in this chat' })
    res.json(await getChatMembers(chatId))
  } catch (err) {
    next(err)
  }
})

router.post('/chat/:id/members', async (req, res, next) => {
  try {
    const profileId = await me(res)
    if (profileId == null) return
    const chatId = chatIdParam(req)
    if (!chatId) return res.status(400).send('Bad chat id')
    res.json(await addChatMembers(chatId, profileId, idList(req.body.memberIds)))
  } catch (err) {
    handle(err, res, next)
  }
})

router.delete('/chat/:id/members/:profileId', async (req, res, next) => {
  try {
    const profileId = await me(res)
    if (profileId == null) return
    const chatId = chatIdParam(req)
    const targetId = Number(req.params.profileId)
    if (!chatId || !Number.isInteger(targetId))
      return res.status(400).send('Bad id')
    await removeChatMember(chatId, profileId, targetId)
    res.status(204).end()
  } catch (err) {
    handle(err, res, next)
  }
})

router.delete('/chat/:id', async (req, res, next) => {
  try {
    const profileId = await me(res)
    if (profileId == null) return
    const chatId = chatIdParam(req)
    if (!chatId) return res.status(400).send('Bad chat id')
    await leaveChat(chatId, profileId)
    res.status(204).end()
  } catch (err) {
    handle(err, res, next)
  }
})

// ---------- messages ----------

router.get('/:id', async (req, res, next) => {
  try {
    const profileId = await me(res)
    if (profileId == null) return
    const chatId = chatIdParam(req)
    if (!chatId) return res.status(400).send('Bad chat id')
    if (!(await isChatMember(chatId, profileId)))
      return res.status(403).json({ message: 'You are not in this chat' })
    res.json(await getmessages(String(chatId)))
  } catch (err) {
    next(err)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const profileId = await me(res)
    if (profileId == null) return
    const chatid = Number(req.body.chatid)
    if (!(await isChatMember(chatid, profileId)))
      return res.status(403).json({ message: 'You are not in this chat' })

    // Only real message types from clients; 'system' notices are server-made
    const type = req.body.type === 'img' ? 'img' : 'text'
    const text = typeof req.body.text === 'string' ? req.body.text.trim() : ''
    if (!text) return res.status(400).json({ message: 'Empty message' })

    await newmessage({
      chatid,
      senderid: profileId,
      type,
      text,
      send_date: new Date(),
    })
    return res.status(200).send('Nothing there')
  } catch (err) {
    next(err)
  }
})

router.post('/status', async (req, res, next) => {
  const linkmatch = res.locals.session.session.userId
  try {
    const data = req.body
    await changeStatus(linkmatch, data.status)
    return res.status(200).end()
  } catch (error) {
    next(error)
  }
})

//wow deletion
router.delete('/', async (req, res, next) => {
  try {
    const linkmatch = res.locals.session.session.userId
    const userId = await getLinkId(linkmatch)
    const data = req.body
    const lerespones = await deleteMessage(data.id, userId.id)
    return res.status(200).send(lerespones)
  } catch (err) {
    next(err)
  }
})

router.put('/', async (req, res, next) => {
  try {
    const linkmatch = res.locals.session.session.userId
    const userId = await getLinkId(linkmatch)
    const data = req.body
    const lerespones = await editMessage(data.id, userId.id, data.text)
    return res.status(200).send(lerespones)
  } catch (err) {
    next(err)
  }
})

export default router
