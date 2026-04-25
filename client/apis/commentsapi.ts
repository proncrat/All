import request from 'superagent'
const rootURL = new URL(`/api/v1`, document.baseURI)

export async function addComment(comment) {
  const requestURL = request.post(`http://localhost:3000/api/v1/comments`)
  const response = await requestURL.send(comment)
  return response.body
}
