import request from 'superagent'

const rootURL = new URL(`/api/v1`, document.baseURI)

//user apis

export async function getUserData(userId: string, route?: string) {
  let theRoute = ''
  if (route) {
    theRoute = '/' + route
  }

  return request
    .get(`http://localhost:3000/api/v1/profile/${userId}${theRoute}`)
    .then((res) => res.body)
    .catch(logError)
}

//comments
export async function getCommentsByLinkClient(
  linkId: string,
  LinkType: string,
) {
  return request
    .get(
      `http://localhost:3000/api/v1/comments?linkid=${linkId}&linktype=${LinkType}`,
    )
    .then((res) => res.body)
    .catch(logError)
}

//Test function
export async function getUsers() {
  return request
    .get(`http://localhost:3000/api/v1/profile`)
    .then((res) => res.body)
    .catch(logError)
}

//video api
export async function getVideosById(Id: string) {
  return request
    .get(`http://localhost:3000/api/v1/video/${Id}`)
    .then((res) => res.body)
    .catch(logError)
}

//util
export async function getprofilematchid(linkId: string) {
  return request
    .get(`http://localhost:3000/api/v1/util/id?linkid=${linkId}`)
    .then((res) => res.body)
    .catch(logError)
}

//coms
export async function getmessagesbyid(chatId: string) {
  return request
    .get(`http://localhost:3000/api/v1/coms/${chatId}`)
    .then((res) => res.body)
    .catch(logError)
}

export async function getchatsbyid(userId: string) {
  return request
    .get(`http://localhost:3000/api/v1/coms/chats/${userId}`)
    .then((res) => res.body)
    .catch(logError)
}

//Make usefull
function logError(err: Error) {
  console.log(err)
  if (err.message === 'Username Taken') {
    throw new Error('Username already taken - please choose another')
  } else if (err.message === 'Forbidden') {
    throw new Error(
      'Only the user who added the fruit may update and delete it',
    )
  } else {
    console.error('Error consuming the API (in client/api.js):', err.message)
    throw err
  }
}
