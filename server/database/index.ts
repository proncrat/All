import db from './connection.ts'

export async function getProfile(userId: string) {
  return await db('profiledata').where('id', userId).select().first()
}
