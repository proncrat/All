import request from 'superagent'
const rootURL = new URL(`/api/v1`, document.baseURI)

export async function sendMessage(message) {
  const requestURL = request.post(`${rootURL}/coms`)
  const response = await requestURL.send(message)
  return response.body
}

export async function deleteMessage(data) {
  const requestURL = request.delete(`${rootURL}/coms`)
  const response = await requestURL.send(data)
  return response.body
}

export async function editMessage(data) {
  const requestURL = request.put(`${rootURL}/coms`)
  const response = await requestURL.send(data)
  return response.body
}

export interface ChatMember {
  id: number
  name: string
  pfp: string | null
  link_id: string
  is_creator?: boolean // only on the members endpoint
}

export interface ChatSummary {
  chatid: number
  name: string | null
  members: ChatMember[] // everyone except you
  last_message_id: number | null
}

/** Pulls the server's { message } out of a failed request. */
function errorMessage(err: unknown, fallback: string) {
  const msg = (err as { response?: { body?: { message?: string } } }).response
    ?.body?.message
  return new Error(msg || fallback)
}

export async function newChat(data: { memberIds: number[]; name?: string }) {
  try {
    const res = await request.post(`${rootURL}/coms/chat`).send(data)
    return res.body as { chatid: number; created: boolean }
  } catch (err) {
    throw errorMessage(err, 'Could not start the chat')
  }
}

export async function getChatMembers(chatId: string | number) {
  const res = await request.get(`${rootURL}/coms/chat/${chatId}/members`)
  return res.body as ChatMember[]
}

export async function addChatMembers(chatId: string | number, memberIds: number[]) {
  try {
    const res = await request
      .post(`${rootURL}/coms/chat/${chatId}/members`)
      .send({ memberIds })
    return res.body as { added: number[] }
  } catch (err) {
    throw errorMessage(err, 'Could not add people')
  }
}

export async function leaveChat(chatId: string | number) {
  try {
    await request.delete(`${rootURL}/coms/chat/${chatId}`)
  } catch (err) {
    throw errorMessage(err, 'Could not delete the chat')
  }
}

/** Chat creator only. */
export async function removeChatMember(chatId: string | number, profileId: number) {
  try {
    await request.delete(`${rootURL}/coms/chat/${chatId}/members/${profileId}`)
  } catch (err) {
    throw errorMessage(err, 'Could not remove them')
  }
}
