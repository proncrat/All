import request from 'superagent'
const rootURL = new URL(`/api/v1`, document.baseURI)

export async function addComment(comment) {
  const requestURL = request.post(`${rootURL}/comments`)
  const response = await requestURL.send(comment)
  return response.body
}

export async function deleteComment(data) {
  const requestURL = request.delete(`${rootURL}/comments`)
  const response = await requestURL.send(data)
  return response.body
}
