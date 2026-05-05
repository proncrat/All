import { sendDataToAllClients } from '../Routes/test.ts'
import db from './connection.ts'

//util

export async function generateProfile(name: string, id: string) {
  return await db('profiledata').insert({ name: name, link_id: id })
}

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
    .select('description', 'links')
    .first()
}

export async function getSongsByUser(userId: string) {
  return await db('songs').where('author_id', userId).select()
}

//Video functions

const get_video_schema = [
  'profiledata.name as username',
  'profiledata.pfp',
  'profiledata.followers',
  'profiledata.id as userid',
  'videos.id',
  'videos.name',
  'videos.description',
  'videos.views',
  'videos.author_id',
  'videos.post_date',
  'videos.likes',
  'videos.dislikes',
  'videos.shares',
  'videos.video_link',
  'videos.thumbnail_link',
]

export async function getVideoById(Id: string) {
  return await db('videos')
    .where('videos.id', Id)
    .join('profiledata', 'videos.author_id', 'profiledata.id')
    .select(get_video_schema)
    .first()
}

//messaging shid

const get_chats_schema = ['chats.chatid', 'profiledata.name', 'profiledata.pfp']

export async function getchats(ownerid: string) {
  return await db('chats')
    .where('ownerid', ownerid)
    .select(get_chats_schema)
    .join('profiledata', 'chats.recieverid', 'profiledata.id')
}

const get_messages_schema = [
  'messages.id',
  'messages.chatid',
  'messages.senderid',
  'messages.type',
  'messages.text',
  'messages.send_date as date',
  'profiledata.name',
  'profiledata.pfp',
]

export async function getmessages(chatId: string) {
  return await db('messages')
    .where('chatid', chatId)
    .select(get_messages_schema)
    .join('profiledata', 'messages.senderid', 'profiledata.id')
    .orderBy([{ column: 'messages.id', order: 'desc' }])
}

export async function newmessage(data) {
  sendDataToAllClients('newmessage')
  return await db('messages').insert({ ...data })
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

//comments

const get_comment_schema = [
  'comments.post_date',
  'profiledata.pfp',
  'comments.body_text',
  'comments.id',
  'profiledata.name',
  'profiledata.id as authorId',
]

export async function getCommentsByLink(linkId: string, LinkType: string) {
  return await db('comments')
    .join('profiledata', 'comments.author_id', 'profiledata.id')
    .where('comments.link_id', linkId)
    .andWhere('comments.Link_type', LinkType)
    .select(get_comment_schema)
    .orderBy([{ column: 'comments.id', order: 'desc' }])
}

export async function newCommentByLink(data) {
  return await db('comments').insert({ ...data })
}

//Util
export async function getIdMatch(LinkId) {
  return await db('profiledata').select('id').where({ link_id: LinkId }).first()
}
