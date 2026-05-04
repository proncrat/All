import request from 'superagent'
//const rootURL = new URL(`/api/v1`, document.baseURI)

export async function sendMessage(message) {
  const requestURL = request.post(`http://localhost:3000/api/v1/coms`)
  const response = await requestURL.send(message)
  return response.body
}
