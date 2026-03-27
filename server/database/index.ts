import db from './connection.ts'

//Profile functions
export async function getProfile(userId: string) {
  return await db('profiledata').where('id', userId).select().first()
}

export async function getVideosByUser(userId: string) {
  return await db('videos').where('author_id', userId).select()
}

export async function getPostsByUser(userId: string) {
  return await db('posts').where('author_id', userId).select()
}

export async function getPhotosByUser(userId: string) {
  return await db('photos').where('author_id', userId).select()
}

export async function getDescriptionByUser(userId: string) {
  return await db('profiledata')
    .where('id', userId)
    .select('description')
    .first()
}

export async function getSongsByUser(userId: string) {
  return await db('songs').where('author_id', userId).select()
}

//Video functions

export async function getVideoById(Id: string) {
  return await db('videos').where('id', Id).select().first()
}

//Test functions (Probably wont/shouldent be used)
export async function getAllUsers() {
  return await db('profiledata').select()
}
export async function getAllVideos() {
  return await db('videos').select()
}
export async function getAllPosts() {
  return await db('posts').select()
}
export async function getAllPhotos() {
  return await db('photos').select()
}
