import request from 'superagent'
const rootURL = new URL(`/api/v1`, document.baseURI)

export async function sendDataSse(data) {
  const requestURL = request.post(`${rootURL}/test/send-message`)
  const response = await requestURL.send(data)
  return response.body
}
