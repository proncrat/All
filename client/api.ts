import request from 'superagent'

const rootURL = new URL(`/api/v1`, document.baseURI)

export async function getUsers() {
  return request
    .get(`http://localhost:3000/api/v1/profile/`)
    .then((res) => res.body)
    .catch(logError)
}

export async function getUserById(userId: string) {
  return request
    .get(`http://localhost:3000/api/v1/profile/${userId}`)
    .then((res) => res.body)
    .catch(logError)
}

export async function getPhotosByUser(userId: string) {
  return request
    .get(`http://localhost:3000/api/v1/photo/${userId}`)
    .then((res) => res.body)
    .catch(logError)
}

export async function getVideosByUser(userId: string) {
  return request
    .get(`http://localhost:3000/api/v1/video/${userId}`)
    .then((res) => res.body)
    .catch(logError)
}

export async function getPostsByUser(userId: string) {
  return request
    .get(`http://localhost:3000/api/v1/post/${userId}`)
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
