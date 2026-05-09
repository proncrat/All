import request from 'superagent'
const rootURL = new URL(`/api/v1`, document.baseURI)

export async function sendPhoto(data) {
  const requestURL = request.post(`${rootURL}/imgupload`)
  const response = await requestURL.send(data)
  return response.body
}
