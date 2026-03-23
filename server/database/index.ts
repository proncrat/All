import db from './connection.ts'

export async function getAllUsers() {
  return await db('profiledata').select()
}

export async function getProfile(userId: string) {
  return await db('profiledata').where('id', userId).select().first()
}

export async function getAllVideos() {
  return await db('videos').select()
}

export async function getVideosByUser(userId: string) {
  return await db('videos').where('author_id', userId).select()
}
