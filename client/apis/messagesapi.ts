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

export async function newChat(data) {
  const requestURL = request.post(`${rootURL}/coms/chat`)
  const response = await requestURL.send(data)
  return response.body
}
