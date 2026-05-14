import request from 'superagent'
const rootURL = new URL(`/api/v1`, document.baseURI)

export async function addFollow(data) {
  const requestURL = request.post(`${rootURL}/follow`)
  const response = await requestURL.send(data)
  return response.body
}
