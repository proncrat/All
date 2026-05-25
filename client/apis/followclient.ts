import request from 'superagent'
const rootURL = new URL(`/api/v1`, document.baseURI)

export async function addFollow(data) {
  const requestURL = request.post(`${rootURL}/follow`)
  const response = await requestURL.send(data)
  return response.body
}

export async function removeFollow(data) {
  const requestURL = request.post(`${rootURL}/follow/un`)
  const response = await requestURL.send(data)
  return response.body
}

export async function getfollowing(id) {
  return request.get(`${rootURL}/follow/follower/${id}`).then((res) => res.body)
}

export async function getfollowers(id) {
  return request
    .get(`${rootURL}/follow/following/${id}`)
    .then((res) => res.body)
}
