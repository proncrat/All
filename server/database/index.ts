import { sendDataToClient } from '../Routes/test.ts'
import db from './connection.ts'

//auth utilitys

export async function generateProfile(name: string, id: string) {
  return await db('profiledata').insert({ name: name, link_id: id })
}

export async function deleteProfile() {
  return await db('profiledata')
    .where({
      link_id: 'XhSQyjyVutL1sK1qIaqPC4yojygwVM4W',
    })
    .del()
}

//profile get

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

//video get

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

//messaging get

const get_chats_schema = [
  'chats.chatid',
  'profiledata.name',
  'profiledata.pfp',
  'profiledata.peer_id',
]

export async function getchats(ownerid: string) {
  return await db('chats')
    .where('ownerid', ownerid)
    .select(get_chats_schema)
    .join('profiledata', 'chats.recieverid', 'profiledata.id')
}

export async function newchat(data) {
  const result = await db('chats').max('chatid as number').first()
  const newId = result.number + 1

  const { ownerid, recieverid } = data

  const chat1 = {
    chatid: newId,
    ownerid: ownerid,
    recieverid: recieverid,
    start_date: new Date(),
  }

  const chat2 = {
    chatid: newId,
    ownerid: recieverid,
    recieverid: ownerid,
    start_date: new Date(),
  }

  await db('chats').insert({ ...chat1 })
  await db('chats').insert({ ...chat2 })
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

//messaging post

export async function newmessage(data) {
  console.log(data)
  const userid = await getUnIdMatch(data.senderid)
  sendDataToClient(userid.link_id, {
    text: data.text,
    icon: '',
    user: 'person',
  })
  //return await db('messages').insert({ ...data })
}

export async function deleteMessage(messageId: number, requesterId: number) {
  return await db('messages')
    .where('id', messageId)
    .andWhere('senderid', requesterId)
    .del()
}

//Test get all (Probably wont/shouldent be used)
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

export async function deleteCommentById(id: number) {
  return await db('comments').where('id', id).del()
}

//Util to be replaced with auth usesession join?
export async function getIdMatch(LinkId) {
  return await db('profiledata').select('id').where({ link_id: LinkId }).first()
}

export async function getUnIdMatch(LinkId) {
  return await db('profiledata').select('link_id').where({ id: LinkId }).first()
}

//photo post

export async function newPhoto(data) {
  return await db('photos').insert({ ...data })
}

//Follows
//Move this somewhere else one day
interface Follow {
  following_user_id: number
  followed_user_id: number
  created_at: Date
}

//Actually works lol kindoff make function to factcheck this

export async function updateUserfollows(data: Follow) {
  //the follower?
  const numbers = await db('follows')
    .where({
      following_user_id: data.following_user_id,
    })
    .select()

  //console.log(numbers.length)

  //the current one following
  const numbers1 = await db('follows')
    .where({
      followed_user_id: data.followed_user_id,
    })
    .select()

  //console.log(numbers1.length)

  await db('profiledata')
    .where({ id: data.followed_user_id })
    .update({ following: numbers1.length })
  await db('profiledata')
    .where({ id: data.following_user_id })
    .update({ followers: numbers.length })
}

export async function newFollowById(data: Follow) {
  await db('follows').insert({ ...data })
  updateUserfollows(data)
}

export async function unFollowById(data: Follow) {
  await db('follows')
    .where({
      following_user_id: data.following_user_id,
      followed_user_id: data.followed_user_id,
    })
    .del()
  updateUserfollows(data)
}
/*
export async function getFollowingById(userId: number) {
  return await db('follows').where({ followed_user_id: userId })
}


export async function getFollowedById(userId: number) {
  return await db('follows').where({ following_user_id: userId })
}
*/

export async function getFollowingById(userId: number) {
  return await db('follows')
    .where('follows.followed_user_id', userId)
    .join('profiledata', 'follows.following_user_id', 'profiledata.id')
}

export async function getFollowedById(userId: number) {
  return await db('follows')
    .where('follows.following_user_id', userId)
    .join('profiledata', 'follows.followed_user_id', 'profiledata.id')
}
