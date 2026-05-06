import request from 'superagent'

//const rootURL = new URL(`/api/v1`, document.baseURI)

const rootURL = 'http://localhost:3000/api/v1'

//user apis

export async function getUserData(userId: string, route?: string) {
  let theRoute = ''
  if (route) {
    theRoute = '/' + route
  }

  return request
    .get(`${rootURL}/profile/${userId}${theRoute}`)
    .then((res) => res.body)
    .catch(logError)
}

//comments
export async function getCommentsByLinkClient(
  linkId: string,
  LinkType: string,
) {
  return request
    .get(`${rootURL}/comments?linkid=${linkId}&linktype=${LinkType}`)
    .then((res) => res.body)
    .catch(logError)
}

//Test function
export async function getUsers() {
  return request
    .get(`${rootURL}/profile`)
    .then((res) => res.body)
    .catch(logError)
}

//video api
export async function getVideosById(Id: string) {
  return request
    .get(`${rootURL}/video/${Id}`)
    .then((res) => res.body)
    .catch(logError)
}

//util
export async function getprofilematchid(linkId: string) {
  return request
    .get(`${rootURL}/util/id?linkid=${linkId}`)
    .then((res) => res.body)
    .catch(logError)
}

//coms
export async function getmessagesbyid(chatId: string) {
  return request
    .get(`${rootURL}/coms/${chatId}`)
    .then((res) => res.body)
    .catch(logError)
}

export async function getchatsbyid(userId: string) {
  return request
    .get(`${rootURL}/coms/chats/${userId}`)
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
