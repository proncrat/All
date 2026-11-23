//import { sendDataToClient } from '../Routes/test.ts'
import { emitToUser, sendDataToClient } from '../socket.ts'
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

export interface PostImage {
  id: number
  url: string
}

/** Attaches each post's images (in order) as `images`. */
async function withPostImages<T extends { id: number }>(
  posts: T[],
): Promise<(T & { images: PostImage[] })[]> {
  if (posts.length === 0) return []
  const rows = await db('post_images')
    .whereIn(
      'post_id',
      posts.map((p) => p.id),
    )
    .orderBy(['post_id', 'position', 'id'])
    .select('id', 'post_id', 'url')
  const byPost = new Map<number, PostImage[]>()
  for (const r of rows) {
    const list = byPost.get(Number(r.post_id)) ?? []
    list.push({ id: r.id, url: r.url })
    byPost.set(Number(r.post_id), list)
  }
  return posts.map((p) => ({ ...p, images: byPost.get(Number(p.id)) ?? [] }))
}

export async function getPostsByUser(userId: string) {
  const posts = await db('posts')
    .where('author_id', userId)
    .orderBy('post_date', 'desc')
    .select()
  return await withPostImages(posts)
}

/** One post with its images and author handle/avatar. */
export async function getPostById(id: number) {
  const post = await db('posts')
    .leftJoin('profiledata', 'profiledata.id', 'posts.author_id')
    .where('posts.id', id)
    .select('posts.*', 'profiledata.name as handle', 'profiledata.pfp as avatar')
    .first()
  if (!post) return undefined
  const [full] = await withPostImages([post])
  return full
}

export async function getPhotosByUser(userId: string) {
  return await db('photos')
    .join('profiledata', 'profiledata.id', 'photos.author_id')
    .where('photos.author_id', userId)
    .select(
      'photos.*',
      'profiledata.name as handle',
      'profiledata.pfp as avatar',
      'photos.uploaded_at as date',
    )
}

export interface ProfileUpdate {
  name?: string
  describe?: string
  description?: string
  links?: string
  pfp?: string
  bg?: string
  banner?: string
}

export async function updateProfile(id: number, data: ProfileUpdate) {
  await db('profiledata').where('id', id).update(data)
  return await db('profiledata').where('id', id).select().first()
}

export async function getDescriptionByUser(userId: string) {
  return await db('profiledata')
    .where('id', userId)
    .select('description', 'links')
    .first()
}

/** Song columns, with the album's cover used when a song has none. */
const SONG_COLUMNS = [
  'songs.id',
  'songs.name',
  'songs.url',
  'songs.runtime',
  'songs.author',
  'songs.author_id',
  'songs.album_id',
  'songs.track_number',
  'albums.title as album_title',
  db.raw('coalesce(songs.cover, albums.cover) as cover'),
]

export async function getSongsByUser(userId: string) {
  return await db('songs')
    .leftJoin('albums', 'songs.album_id', 'albums.id')
    .where('songs.author_id', userId)
    .select(SONG_COLUMNS)
    .orderBy('songs.id', 'asc')
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

// Chats are `conversations` with any number of `conversation_members`.
// Leaving a chat removes only the leaver's member row; messages are kept.

export interface ChatMember {
  id: number
  name: string
  pfp: string | null
  link_id: string
}

export interface ChatSummary {
  chatid: number
  name: string | null // custom name, null = use member names
  members: ChatMember[] // everyone except the viewer
  last_message_id: number | null
}

const MAX_CHAT_MEMBERS = 50

/** Profile ids -> auth ids for socket rooms. */
async function linkIdsFor(profileIds: number[]): Promise<string[]> {
  if (profileIds.length === 0) return []
  const rows = await db('profiledata')
    .whereIn('id', profileIds)
    .whereNotNull('link_id')
    .select('link_id')
  return rows.map((r) => r.link_id)
}

/** Tells these profiles to refetch their chat list / member lists. */
async function notifyChatUpdate(profileIds: number[], chatid: number) {
  for (const linkId of await linkIdsFor(profileIds)) {
    emitToUser(linkId, 'chat:update', { chatid })
  }
}

export async function getChatMemberIds(chatId: number): Promise<number[]> {
  const rows = await db('conversation_members')
    .where('conversation_id', chatId)
    .select('profile_id')
  return rows.map((r) => Number(r.profile_id))
}

export async function isChatMember(chatId: number, profileId: number) {
  const row = await db('conversation_members')
    .where({ conversation_id: chatId, profile_id: profileId })
    .first('id')
  return Boolean(row)
}

/** Members in join order; `is_creator` marks who can remove people. */
export async function getChatMembers(
  chatId: number,
): Promise<(ChatMember & { is_creator: boolean })[]> {
  const chat = await db('conversations').where('id', chatId).first('created_by')
  const rows = await db('conversation_members')
    .join('profiledata', 'profiledata.id', 'conversation_members.profile_id')
    .where('conversation_members.conversation_id', chatId)
    // member row ids grow with each join (joined_at mixes formats in SQLite)
    .orderBy('conversation_members.id', 'asc')
    .select(
      'profiledata.id',
      'profiledata.name',
      'profiledata.pfp',
      'profiledata.link_id',
    )
  return rows.map((m) => ({
    ...m,
    is_creator: chat?.created_by != null && Number(chat.created_by) === m.id,
  }))
}

/** The longest-standing member takes over as creator (or null if empty). */
async function passCreatorOn(chatId: number) {
  const next = await db('conversation_members')
    .where('conversation_id', chatId)
    .orderBy('id', 'asc')
    .first('profile_id')
  await db('conversations')
    .where('id', chatId)
    .update({ created_by: next?.profile_id ?? null })
}

/**
 * The chat's creator removes someone else. Their messages stay; they just
 * can't see or post in the chat any more.
 */
export async function removeChatMember(
  chatId: number,
  actorId: number,
  targetId: number,
) {
  if (actorId === targetId)
    throw new ChatError(400, 'Use delete chat to leave it yourself')
  const chat = await db('conversations').where('id', chatId).first('created_by')
  if (!chat || !(await isChatMember(chatId, actorId)))
    throw new ChatError(403, 'You are not in this chat')
  if (Number(chat.created_by) !== actorId)
    throw new ChatError(403, 'Only the person who made the chat can remove people')

  const removed = await db('conversation_members')
    .where({ conversation_id: chatId, profile_id: targetId })
    .del()
  if (!removed) throw new ChatError(404, 'That person is not in this chat')

  await systemMessage(
    chatId,
    actorId,
    `${await profileName(actorId)} removed ${await profileName(targetId)}`,
  )
  const remaining = await getChatMemberIds(chatId)
  await notifyChatUpdate([targetId, ...remaining], chatId)
}

/** Every chat the profile is in, most recently active first. */
export async function getChatsForProfile(
  profileId: number,
): Promise<ChatSummary[]> {
  const chats = await db('conversations')
    .join(
      'conversation_members',
      'conversation_members.conversation_id',
      'conversations.id',
    )
    .where('conversation_members.profile_id', profileId)
    .select('conversations.id', 'conversations.name')
  if (chats.length === 0) return []
  const ids = chats.map((c) => c.id)

  const members = await db('conversation_members')
    .join('profiledata', 'profiledata.id', 'conversation_members.profile_id')
    .whereIn('conversation_members.conversation_id', ids)
    .whereNot('conversation_members.profile_id', profileId)
    .orderBy('conversation_members.id', 'asc')
    .select(
      'conversation_members.conversation_id as chatid',
      'profiledata.id',
      'profiledata.name',
      'profiledata.pfp',
      'profiledata.link_id',
    )

  const last = await db('messages')
    .whereIn('chatid', ids)
    .groupBy('chatid')
    .select('chatid')
    .max('id as last_id')

  const membersBy = new Map<number, ChatMember[]>()
  for (const { chatid, ...m } of members) {
    const list = membersBy.get(Number(chatid)) ?? []
    list.push(m)
    membersBy.set(Number(chatid), list)
  }
  const lastBy = new Map(last.map((r) => [Number(r.chatid), Number(r.last_id)]))

  return chats
    .map((c) => ({
      chatid: Number(c.id),
      name: c.name ?? null,
      members: membersBy.get(Number(c.id)) ?? [],
      last_message_id: lastBy.get(Number(c.id)) ?? null,
    }))
    .sort(
      (a, b) =>
        (b.last_message_id ?? 0) - (a.last_message_id ?? 0) ||
        b.chatid - a.chatid,
    )
}

/** Only people the actor follows can be added to a chat. */
async function followedSubset(
  actorId: number,
  profileIds: number[],
): Promise<number[]> {
  if (profileIds.length === 0) return []
  // follows: followed_user_id = the follower, following_user_id = who they follow
  const rows = await db('follows')
    .where('followed_user_id', actorId)
    .whereIn('following_user_id', profileIds)
    .select('following_user_id')
  return [...new Set(rows.map((r) => Number(r.following_user_id)))]
}

async function profileName(id: number) {
  const row = await db('profiledata').where('id', id).first('name')
  return (row?.name as string) ?? 'Someone'
}

/** Inserts a "X added Y" style notice into the chat and pushes it out. */
async function systemMessage(chatId: number, actorId: number, text: string) {
  return await newmessage({
    chatid: chatId,
    senderid: actorId,
    type: 'system',
    text: text.slice(0, 255),
    send_date: new Date(),
  })
}

export class ChatError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

/**
 * Starts a chat with the given people (who must be followed by the creator).
 * A 1:1 chat with someone you already have an active 1:1 chat with is reused.
 */
export async function createChat(
  creatorId: number,
  memberIds: number[],
  name?: string | null,
) {
  const wanted = [...new Set(memberIds.map(Number))].filter(
    (id) => Number.isInteger(id) && id !== creatorId,
  )
  const allowed = await followedSubset(creatorId, wanted)
  if (allowed.length === 0)
    throw new ChatError(400, 'Pick at least one person you follow')
  if (allowed.length + 1 > MAX_CHAT_MEMBERS)
    throw new ChatError(400, `Chats are limited to ${MAX_CHAT_MEMBERS} people`)

  if (allowed.length === 1 && !name) {
    const existing = await findDirectChat(creatorId, allowed[0])
    if (existing != null) return { chatid: existing, created: false }
  }

  const chatid = await db.transaction(async (trx) => {
    const rows = await trx('conversations')
      .insert({
        name: name?.trim().slice(0, 100) || null,
        created_by: creatorId,
        created_at: new Date(),
      })
      .returning('id')
    const id = insertedId(rows)!
    await trx('conversation_members').insert(
      [creatorId, ...allowed].map((profile_id) => ({
        conversation_id: id,
        profile_id,
        joined_at: new Date(),
      })),
    )
    return id
  })

  await notifyChatUpdate([creatorId, ...allowed], chatid)
  return { chatid, created: true }
}

/** An unnamed chat whose only members are exactly these two people. */
async function findDirectChat(a: number, b: number) {
  const rows = await db('conversation_members as m')
    .join('conversations as c', 'c.id', 'm.conversation_id')
    .whereNull('c.name')
    .whereIn(
      'm.conversation_id',
      db('conversation_members')
        .where('profile_id', a)
        .select('conversation_id'),
    )
    .groupBy('m.conversation_id')
    .select(
      'm.conversation_id as id',
      db.raw('COUNT(*) as total'),
      db.raw('SUM(CASE WHEN m.profile_id IN (?, ?) THEN 1 ELSE 0 END) as hits', [
        a,
        b,
      ]),
    )
  const match = rows.find((r) => Number(r.total) === 2 && Number(r.hits) === 2)
  return match ? Number(match.id) : null
}

/** Adds people the actor follows to a chat the actor is in. */
export async function addChatMembers(
  chatId: number,
  actorId: number,
  profileIds: number[],
) {
  if (!(await isChatMember(chatId, actorId)))
    throw new ChatError(403, 'You are not in this chat')

  const current = await getChatMemberIds(chatId)
  const fresh = (await followedSubset(actorId, profileIds)).filter(
    (id) => !current.includes(id),
  )
  if (fresh.length === 0) return { added: [] as number[] }
  if (current.length + fresh.length > MAX_CHAT_MEMBERS)
    throw new ChatError(400, `Chats are limited to ${MAX_CHAT_MEMBERS} people`)

  await db('conversation_members').insert(
    fresh.map((profile_id) => ({
      conversation_id: chatId,
      profile_id,
      joined_at: new Date(),
    })),
  )

  const names = await db('profiledata').whereIn('id', fresh).select('name')
  await systemMessage(
    chatId,
    actorId,
    `${await profileName(actorId)} added ${names.map((n) => n.name).join(', ')}`,
  )
  await notifyChatUpdate([...current, ...fresh], chatId)
  return { added: fresh }
}

/**
 * Removes the profile from the chat ("delete chat" from their side). The
 * conversation and every message stay, so the other members keep the chat.
 */
export async function leaveChat(chatId: number, profileId: number) {
  const removed = await db('conversation_members')
    .where({ conversation_id: chatId, profile_id: profileId })
    .del()
  if (!removed) throw new ChatError(404, 'You are not in this chat')

  const chat = await db('conversations').where('id', chatId).first('created_by')
  if (chat && Number(chat.created_by) === profileId) await passCreatorOn(chatId)

  const remaining = await getChatMemberIds(chatId)
  if (remaining.length) {
    await systemMessage(
      chatId,
      profileId,
      `${await profileName(profileId)} left the chat`,
    )
  }
  await notifyChatUpdate([profileId, ...remaining], chatId)
}

const get_messages_schema = [
  'messages.id',
  'messages.chatid',
  'messages.senderid',
  'messages.type',
  'messages.text',
  'messages.send_date as date',
  'messages.is_edited as edited',
  'profiledata.name',
  'profiledata.pfp',
]

export async function getmessages(chatId: string) {
  return await db('messages')
    .where('chatid', chatId)
    .select(get_messages_schema)
    .leftJoin('profiledata', 'messages.senderid', 'profiledata.id')
    .orderBy([{ column: 'messages.id', order: 'asc' }])
}

//messaging post
/*
export async function newmessage(data) {
  console.log(data)
  const userid = await getUnIdMatch(data.senderid)
  sendDataToClient(userid.link_id, {
    text: data.text,
    icon: '',
    user: 'person',
  })
  return await db('messages').insert({ ...data })
}
*/

export async function newmessage(data) {
  console.log(data)

  // 1. save first, then emit the saved row
  const [saved] = await db('messages')
    .insert({ ...data })
    .returning('*')

  // 2. everyone currently in this chat (including the sender's other tabs),
  //    internal profile id -> auth id (link_id) -> their socket room
  const members = await getChatMemberIds(Number(data.chatid))
  for (const linkId of await linkIdsFor(members)) {
    sendDataToClient(linkId, saved)
  }

  return saved
}

export async function editMessage(
  messageId: number,
  requesterId: number,
  newText: string,
) {
  return await db('messages')
    .where('id', messageId)
    .andWhere('senderid', requesterId)
    .andWhereNot('type', 'system')
    .update({ is_edited: true, text: newText })
}

export async function deleteMessage(messageId: number, requesterId: number) {
  return await db('messages')
    .where('id', messageId)
    .andWhere('senderid', requesterId)
    .andWhereNot('type', 'system')
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
    .andWhere('comments.link_type', LinkType)
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

export async function getPhotoByUserId(
  userId: number | string,
  limit: number,
  cursor: { uploaded_at: string; id: number | string } | null = null,
) {
  const query = db('photos')
    .join('profiledata', 'profiledata.id', '=', 'photos.author_id')
    .select(
      'photos.*',
      db.raw('cast(photos.uploaded_at as text) as uploaded_at_cursor'),
      'profiledata.name as handle',
      'profiledata.pfp as avatar',
      'photos.uploaded_at as date',
    )
    .where('photos.author_id', '=', userId)
    .orderBy([
      { column: 'photos.uploaded_at', order: 'desc' },
      { column: 'photos.id', order: 'desc' },
    ])
    .limit(limit + 1)

  if (cursor) {
    // Qualify columns here too so SQLite doesn't get confused during cursor comparison
    query.whereRaw('(photos.uploaded_at, photos.id) < (?, ?)', [
      cursor.uploaded_at,
      cursor.id,
    ])
  }

  const rows = await query

  const hasMore = rows.length > limit
  const items = hasMore ? rows.slice(0, limit) : rows
  const last = items[items.length - 1]

  return {
    items,
    nextCursor: hasMore
      ? { uploaded_at: last.uploaded_at_cursor, id: last.id }
      : null,
  }
}

export async function getPhotoById(id: number | string) {
  return await db('photos').where('id', id).first()
}

/** One photo with the same shape as getPhotoByUserId's items. */
export async function getPhotoWithAuthor(id: number | string) {
  return await db('photos')
    .join('profiledata', 'profiledata.id', '=', 'photos.author_id')
    .select(
      'photos.*',
      'profiledata.name as handle',
      'profiledata.pfp as avatar',
      'photos.uploaded_at as date',
    )
    .where('photos.id', id)
    .first()
}

export async function newPhoto(data) {
  return await db('photos').insert({ ...data })
}

export async function deletePhoto(id: number | string) {
  return await db('photos').where('id', id).del()
}

//Video / song uploads

/** Normalises knex insert results across SQLite and Postgres. */
function insertedId(rows: unknown[]): number | undefined {
  const first = rows[0] as { id?: number } | number | undefined
  return typeof first === 'object' ? first?.id : first
}

export interface NewVideo {
  name: string
  description: string
  author_id: number
  video_link: string
  thumbnail_link: string | null
}

export async function newVideo(data: NewVideo) {
  const rows = await db('videos')
    .insert({
      ...data,
      views: 0,
      likes: 0,
      dislikes: 0,
      shares: 0,
      post_date: new Date(),
    })
    .returning('id')
  return insertedId(rows)
}

export interface NewSong {
  name: string
  author: string
  author_id: number
  url: string
  runtime: string
  cover: string | null
  album_id?: number | null
  track_number?: number | null
}

export async function newSong(data: NewSong) {
  const rows = await db('songs').insert(data).returning('id')
  return insertedId(rows)
}

export interface NewPost {
  title: string
  the_post: string
  author_id: number
  images: string[] // /images/xxx.webp, in display order
}

export async function newPost({ images, ...data }: NewPost) {
  return await db.transaction(async (trx) => {
    const rows = await trx('posts')
      .insert({
        ...data,
        views: 0,
        likes: 0,
        dislikes: 0,
        shares: 0,
        post_date: new Date(),
      })
      .returning('id')
    const id = insertedId(rows)
    if (id != null && images.length) {
      await trx('post_images').insert(
        images.map((url, position) => ({ post_id: id, url, position })),
      )
    }
    return id
  })
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

//the status slop

export async function changeStatus(userId: number, status: string) {
  return await db('status').where({ userId: userId }).update({ status: status })
}

//Reactions (likes, dislikes, saves, reposts)

export const REACTION_TARGETS = {
  video: 'videos',
  post: 'posts',
  photo: 'photos',
  song: 'songs',
} as const
export type ReactionTarget = keyof typeof REACTION_TARGETS
export type Vote = 'like' | 'dislike'
export type FlagKind = 'save' | 'repost'

export interface ReactionSummary {
  likes: number
  dislikes: number
  saves: number
  reposts: number
  comments: number
  vote: Vote | null
  saved: boolean
  reposted: boolean
}

export async function reactionTargetExists(
  type: ReactionTarget,
  id: number,
): Promise<boolean> {
  return Boolean(await db(REACTION_TARGETS[type]).where('id', id).first('id'))
}

export async function getReactionSummary(
  type: ReactionTarget,
  id: number,
  userId: number | null,
): Promise<ReactionSummary> {
  const counts = (await db('reactions')
    .where({ target_type: type, target_id: id })
    .groupBy('kind')
    .select('kind')
    .count({ n: '*' })) as { kind: string; n: number | string }[]

  // Postgres returns counts as strings, SQLite as numbers
  const count = (kind: string) =>
    Number(counts.find((c) => c.kind === kind)?.n ?? 0)

  const commentRow = await db('comments')
    .where({ link_type: type, link_id: id })
    .count({ n: '*' })
    .first()

  const mine: string[] = userId
    ? await db('reactions')
        .where({ user_id: userId, target_type: type, target_id: id })
        .pluck('kind')
    : []

  return {
    likes: count('like'),
    dislikes: count('dislike'),
    saves: count('save'),
    reposts: count('repost'),
    comments: Number(commentRow?.n ?? 0),
    vote: mine.includes('like')
      ? 'like'
      : mine.includes('dislike')
        ? 'dislike'
        : null,
    saved: mine.includes('save'),
    reposted: mine.includes('repost'),
  }
}

/** Sets (or clears, with null) the user's like/dislike on a target. */
export async function setVote(
  userId: number,
  type: ReactionTarget,
  id: number,
  vote: Vote | null,
) {
  await db.transaction(async (trx) => {
    const target = { user_id: userId, target_type: type, target_id: id }
    await trx('reactions')
      .where(target)
      .whereIn('kind', ['like', 'dislike'])
      .del()
    if (vote) await trx('reactions').insert({ ...target, kind: vote })

    // videos and posts also keep denormalised like/dislike counts
    if (type === 'video' || type === 'post') {
      const count = async (kind: Vote) =>
        Number(
          (
            await trx('reactions')
              .where({ target_type: type, target_id: id, kind })
              .count({ n: '*' })
              .first()
          )?.n ?? 0,
        )
      await trx(REACTION_TARGETS[type])
        .where('id', id)
        .update({
          likes: await count('like'),
          dislikes: await count('dislike'),
        })
    }
  })
}

/** Turns a save or repost on or off. Safe to call repeatedly. */
export async function setReactionFlag(
  userId: number,
  type: ReactionTarget,
  id: number,
  kind: FlagKind,
  active: boolean,
) {
  const row = { user_id: userId, target_type: type, target_id: id, kind }
  if (active) {
    await db('reactions')
      .insert({ ...row, created_at: new Date() })
      .onConflict(['user_id', 'target_type', 'target_id', 'kind'])
      .ignore()
  } else {
    await db('reactions').where(row).del()
  }
}

/** A user's saves / reposts / likes, newest first. */
export async function getUserReactions(
  userId: number,
  kind: Vote | FlagKind,
  type?: ReactionTarget,
) {
  const query = db('reactions')
    .where({ user_id: userId, kind })
    .select('target_type', 'target_id', 'created_at')
    .orderBy('created_at', 'desc')
  if (type) query.andWhere('target_type', type)
  return await query
}

/** A reacted-to item with enough detail to render a card. */
export interface LibraryItem {
  type: ReactionTarget
  id: number
  title: string
  image: string | null
  author: string | null
  author_id: number | null
  text?: string | null // post body
  media?: string | null // song audio url / video file
  runtime?: string | null // songs
  posted_at?: string | number | Date | null // posts
  author_avatar?: string | null // posts
  reacted_at: string | number | Date
}

export type Library = Record<Vote | FlagKind, LibraryItem[]>

/** Loads card details for a set of ids of one type, keyed by id. */
async function libraryDetails(
  type: ReactionTarget,
  ids: number[],
): Promise<Map<number, Omit<LibraryItem, 'reacted_at'>>> {
  if (!ids.length) return new Map()
  const table = REACTION_TARGETS[type]
  const base = db(table)
    .leftJoin('profiledata', `${table}.author_id`, 'profiledata.id')
    .whereIn(`${table}.id`, ids)

  let rows: Omit<LibraryItem, 'reacted_at'>[]
  if (type === 'video') {
    rows = (
      await base.select(
        'videos.id',
        'videos.name',
        'videos.thumbnail_link',
        'videos.video_link',
        'videos.author_id',
        'profiledata.name as author',
      )
    ).map((r) => ({
      type,
      id: r.id,
      title: r.name,
      image: r.thumbnail_link,
      media: r.video_link,
      author: r.author,
      author_id: r.author_id,
    }))
  } else if (type === 'post') {
    rows = (
      await base.select(
        'posts.id',
        'posts.title',
        'posts.the_post',
        'posts.post_date',
        'posts.author_id',
        'profiledata.name as author',
        'profiledata.pfp as author_avatar',
      )
    ).map((r) => ({
      type,
      id: r.id,
      title: r.title,
      image: null,
      text: r.the_post,
      posted_at: r.post_date,
      author_avatar: r.author_avatar,
      author: r.author,
      author_id: r.author_id,
    }))
  } else if (type === 'photo') {
    rows = (
      await base.select(
        'photos.id',
        'photos.name',
        'photos.thumburl',
        'photos.url',
        'photos.author_id',
        'profiledata.name as author',
      )
    ).map((r) => ({
      type,
      id: r.id,
      title: r.name,
      image: r.thumburl || r.url,
      author: r.author,
      author_id: r.author_id,
    }))
  } else {
    rows = (
      await base
        .leftJoin('albums', 'songs.album_id', 'albums.id')
        .select(
          'songs.id',
          'songs.name',
          db.raw('coalesce(songs.cover, albums.cover) as cover'),
          'songs.url',
          'songs.runtime',
          'songs.author',
          'songs.author_id',
        )
    ).map((r) => ({
      type,
      id: r.id,
      title: r.name,
      image: r.cover,
      media: r.url,
      runtime: r.runtime,
      author: r.author,
      author_id: r.author_id,
    }))
  }
  return new Map(rows.map((r) => [Number(r.id), r]))
}

/**
 * Everything a user has liked, disliked, saved or reposted, newest first,
 * with card details. Items whose target was deleted are left out.
 */
export async function getLibrary(
  userId: number,
  limitPerKind = 100,
): Promise<Library> {
  const reactions: {
    kind: Vote | FlagKind
    target_type: ReactionTarget
    target_id: number
    created_at: string | number | Date
  }[] = await db('reactions')
    .where({ user_id: userId })
    .whereIn('target_type', Object.keys(REACTION_TARGETS))
    .select('kind', 'target_type', 'target_id', 'created_at')
    .orderBy('created_at', 'desc')
    .orderBy('id', 'desc')

  // One query per content type, not per item
  const idsByType = new Map<ReactionTarget, Set<number>>()
  for (const r of reactions) {
    if (!idsByType.has(r.target_type)) idsByType.set(r.target_type, new Set())
    idsByType.get(r.target_type)!.add(Number(r.target_id))
  }
  const details = new Map(
    await Promise.all(
      [...idsByType].map(
        async ([type, ids]) =>
          [type, await libraryDetails(type, [...ids])] as const,
      ),
    ),
  )

  const library: Library = { like: [], dislike: [], save: [], repost: [] }
  for (const r of reactions) {
    const list = library[r.kind]
    if (!list || list.length >= limitPerKind) continue
    const item = details.get(r.target_type)?.get(Number(r.target_id))
    if (item) list.push({ ...item, reacted_at: r.created_at })
  }
  return library
}

/**
 * Things a profile has reposted (optionally one content type), newest first,
 * with card details. Public — shown on the profile's "Reposts" tab.
 */
export async function getProfileReposts(
  userId: number,
  type?: ReactionTarget,
  limit = 200,
): Promise<LibraryItem[]> {
  const query = db('reactions')
    .where({ user_id: userId, kind: 'repost' })
    .whereIn('target_type', type ? [type] : Object.keys(REACTION_TARGETS))
    .select('target_type', 'target_id', 'created_at')
    .orderBy('created_at', 'desc')
    .orderBy('id', 'desc')
    .limit(limit)
  const reactions: {
    target_type: ReactionTarget
    target_id: number
    created_at: string | number | Date
  }[] = await query

  const idsByType = new Map<ReactionTarget, number[]>()
  for (const r of reactions) {
    if (!idsByType.has(r.target_type)) idsByType.set(r.target_type, [])
    idsByType.get(r.target_type)!.push(Number(r.target_id))
  }
  const details = new Map(
    await Promise.all(
      [...idsByType].map(
        async ([t, ids]) => [t, await libraryDetails(t, ids)] as const,
      ),
    ),
  )

  const items: LibraryItem[] = []
  for (const r of reactions) {
    const item = details.get(r.target_type)?.get(Number(r.target_id))
    if (item) items.push({ ...item, reacted_at: r.created_at })
  }
  return items
}

//Playlists

export interface PlaylistRow {
  id: number
  owner_id: number
  title: string
  description: string | null
  type: ReactionTarget
  is_private: boolean
  created_at: string | number | Date
  updated_at: string | number | Date
}

export interface PlaylistSummary extends PlaylistRow {
  owner_name: string | null
  count: number
  covers: string[]
  excerpt: string | null
}

export interface PlaylistDetail extends PlaylistSummary {
  items: (Omit<LibraryItem, 'reacted_at'> & {
    added_at: string | number | Date
  })[]
}

// SQLite returns booleans as 0/1
type PlaylistWithOwner = PlaylistRow & { owner_name?: string | null }

const normalisePlaylist = (row: Record<string, any>): PlaylistWithOwner =>
  ({
    ...row,
    id: Number(row.id),
    owner_id: Number(row.owner_id),
    is_private: Boolean(row.is_private),
  }) as PlaylistWithOwner

/** Adds item counts and cover images to a set of playlists. */
async function summarisePlaylists(
  rows: (PlaylistRow & { owner_name?: string | null })[],
): Promise<PlaylistSummary[]> {
  if (!rows.length) return []
  const items: { playlist_id: number; target_id: number }[] = await db(
    'playlist_items',
  )
    .whereIn(
      'playlist_id',
      rows.map((r) => r.id),
    )
    .select('playlist_id', 'target_id')
    .orderBy('position', 'asc')
    .orderBy('id', 'asc')

  const byPlaylist = new Map<number, number[]>()
  for (const i of items) {
    const key = Number(i.playlist_id)
    if (!byPlaylist.has(key)) byPlaylist.set(key, [])
    byPlaylist.get(key)!.push(Number(i.target_id))
  }

  // Only the first four items of each playlist are needed for covers
  const coverIds = new Map<ReactionTarget, Set<number>>()
  for (const r of rows) {
    if (!coverIds.has(r.type)) coverIds.set(r.type, new Set())
    for (const id of (byPlaylist.get(r.id) ?? []).slice(0, 4))
      coverIds.get(r.type)!.add(id)
  }
  const details = new Map(
    await Promise.all(
      [...coverIds].map(
        async ([type, ids]) =>
          [type, await libraryDetails(type, [...ids])] as const,
      ),
    ),
  )

  return rows.map((r) => {
    const ids = byPlaylist.get(r.id) ?? []
    const firsts = ids
      .slice(0, 4)
      .map((id) => details.get(r.type)?.get(id))
      .filter(Boolean) as Omit<LibraryItem, 'reacted_at'>[]
    return {
      ...r,
      owner_name: r.owner_name ?? null,
      count: ids.length,
      covers: firsts.map((d) => d.image).filter(Boolean) as string[],
      excerpt: firsts.find((d) => d.text)?.text ?? null,
    }
  })
}

function playlistQuery() {
  return db('playlists')
    .leftJoin('profiledata', 'playlists.owner_id', 'profiledata.id')
    .select('playlists.*', 'profiledata.name as owner_name')
}

/** A user's playlists, newest activity first. Private ones only if asked. */
export async function getPlaylistsByOwner(
  ownerId: number,
  {
    includePrivate = false,
    type,
  }: { includePrivate?: boolean; type?: ReactionTarget } = {},
): Promise<PlaylistSummary[]> {
  const query = playlistQuery()
    .where('playlists.owner_id', ownerId)
    .orderBy('playlists.updated_at', 'desc')
    .orderBy('playlists.id', 'desc')
  if (!includePrivate) query.andWhere('playlists.is_private', false)
  if (type) query.andWhere('playlists.type', type)
  return summarisePlaylists((await query).map(normalisePlaylist))
}

export async function getPlaylistRow(id: number): Promise<PlaylistRow | null> {
  const row = await db('playlists').where('id', id).first()
  return row ? normalisePlaylist(row) : null
}

/** A playlist with all of its items in order. Deleted items are left out. */
export async function getPlaylist(id: number): Promise<PlaylistDetail | null> {
  const row = await playlistQuery().where('playlists.id', id).first()
  if (!row) return null
  const [summary] = await summarisePlaylists([normalisePlaylist(row)])

  const items: { target_id: number; added_at: string | number | Date }[] =
    await db('playlist_items')
      .where('playlist_id', id)
      .select('target_id', 'added_at')
      .orderBy('position', 'asc')
      .orderBy('id', 'asc')
  const details = await libraryDetails(
    summary.type,
    items.map((i) => Number(i.target_id)),
  )
  return {
    ...summary,
    items: items.flatMap((i) => {
      const d = details.get(Number(i.target_id))
      return d ? [{ ...d, added_at: i.added_at }] : []
    }),
  }
}

export async function createPlaylist(data: {
  owner_id: number
  title: string
  description?: string | null
  type: ReactionTarget
  is_private?: boolean
}): Promise<number> {
  const now = new Date()
  const [row] = await db('playlists')
    .insert({
      owner_id: data.owner_id,
      title: data.title,
      description: data.description ?? null,
      type: data.type,
      is_private: data.is_private ?? false,
      created_at: now,
      updated_at: now,
    })
    .returning('id')
  return Number(typeof row === 'object' ? row.id : row)
}

export async function updatePlaylist(
  id: number,
  data: { title?: string; description?: string | null; is_private?: boolean },
) {
  await db('playlists')
    .where('id', id)
    .update({ ...data, updated_at: new Date() })
}

export async function deletePlaylist(id: number) {
  // playlist_items cascade
  await db.transaction(async (trx) => {
    await trx('playlist_items').where('playlist_id', id).del()
    await trx('playlists').where('id', id).del()
  })
}

/** Appends an item to the end of a playlist. Safe to call repeatedly. */
export async function addPlaylistItem(playlistId: number, targetId: number) {
  await db.transaction(async (trx) => {
    const last = await trx('playlist_items')
      .where('playlist_id', playlistId)
      .max({ pos: 'position' })
      .first()
    const inserted = await trx('playlist_items')
      .insert({
        playlist_id: playlistId,
        target_id: targetId,
        position: Number(last?.pos ?? -1) + 1,
        added_at: new Date(),
      })
      .onConflict(['playlist_id', 'target_id'])
      .ignore()
      .returning('id')
    if (inserted.length)
      await trx('playlists')
        .where('id', playlistId)
        .update({ updated_at: new Date() })
  })
}

export async function removePlaylistItem(playlistId: number, targetId: number) {
  await db.transaction(async (trx) => {
    const n = await trx('playlist_items')
      .where({ playlist_id: playlistId, target_id: targetId })
      .del()
    if (n)
      await trx('playlists')
        .where('id', playlistId)
        .update({ updated_at: new Date() })
  })
}

/** Ids of the user's playlists (of the item's type) that contain an item. */
export async function getPlaylistIdsContaining(
  ownerId: number,
  type: ReactionTarget,
  targetId: number,
): Promise<number[]> {
  const ids = await db('playlist_items')
    .join('playlists', 'playlist_items.playlist_id', 'playlists.id')
    .where({
      'playlists.owner_id': ownerId,
      'playlists.type': type,
      'playlist_items.target_id': targetId,
    })
    .pluck('playlists.id')
  return ids.map(Number)
}

//Albums

export interface AlbumRow {
  id: number
  author_id: number
  title: string
  description: string | null
  cover: string | null
  release_date: string | null
  created_at: string | number | Date
}

export interface AlbumSummary extends AlbumRow {
  author_name: string | null
  track_count: number
}

export interface AlbumTrack {
  id: number
  name: string
  url: string
  runtime: string
  author: string
  author_id: number
  album_id: number
  track_number: number | null
  album_title: string
  cover: string | null
}

export interface AlbumDetail extends AlbumSummary {
  tracks: AlbumTrack[]
}

export interface AlbumFields {
  title?: string
  description?: string | null
  cover?: string | null
  release_date?: string | null
}

const normaliseAlbum = (row: Record<string, any>): AlbumSummary =>
  ({
    ...row,
    id: Number(row.id),
    author_id: Number(row.author_id),
    track_count: Number(row.track_count ?? 0),
  }) as AlbumSummary

function albumQuery() {
  const counts = db('songs')
    .whereNotNull('album_id')
    .groupBy('album_id')
    .select('album_id', db.raw('count(*) as track_count'))
    .as('counts')
  return db('albums')
    .leftJoin('profiledata', 'albums.author_id', 'profiledata.id')
    .leftJoin(counts, 'counts.album_id', 'albums.id')
    .select(
      'albums.*',
      'profiledata.name as author_name',
      db.raw('coalesce(counts.track_count, 0) as track_count'),
    )
}

/** A user's albums, newest release first. */
export async function getAlbumsByUser(
  authorId: number,
): Promise<AlbumSummary[]> {
  const rows = await albumQuery()
    .where('albums.author_id', authorId)
    // Dated releases first, newest first; then undated ones, newest first
    .orderByRaw('case when albums.release_date is null then 1 else 0 end')
    .orderBy('albums.release_date', 'desc')
    .orderBy('albums.id', 'desc')
  return rows.map(normaliseAlbum)
}

export async function getAlbumRow(id: number): Promise<AlbumRow | null> {
  const row = await db('albums').where('id', id).first()
  return row
    ? { ...row, id: Number(row.id), author_id: Number(row.author_id) }
    : null
}

/** An album with its tracks in order. */
export async function getAlbum(id: number): Promise<AlbumDetail | null> {
  const row = await albumQuery().where('albums.id', id).first()
  if (!row) return null
  const tracks = await db('songs')
    .leftJoin('albums', 'songs.album_id', 'albums.id')
    .where('songs.album_id', id)
    .select(SONG_COLUMNS)
    .orderByRaw('coalesce(songs.track_number, 999999) asc')
    .orderBy('songs.id', 'asc')
  return { ...normaliseAlbum(row), tracks }
}

export async function createAlbum(
  data: AlbumFields & { author_id: number; title: string },
): Promise<number> {
  const rows = await db('albums')
    .insert({
      author_id: data.author_id,
      title: data.title,
      description: data.description ?? null,
      cover: data.cover ?? null,
      release_date: data.release_date ?? null,
      created_at: new Date(),
    })
    .returning('id')
  return Number(insertedId(rows))
}

export async function updateAlbum(id: number, data: AlbumFields) {
  if (Object.keys(data).length) await db('albums').where('id', id).update(data)
}

/** Deletes an album. Its songs stay, as singles. */
export async function deleteAlbum(id: number) {
  await db.transaction(async (trx) => {
    await trx('songs')
      .where('album_id', id)
      .update({ album_id: null, track_number: null })
    await trx('albums').where('id', id).del()
  })
}

/** Track number for a song appended to the end of an album. */
export async function nextTrackNumber(albumId: number): Promise<number> {
  const row = await db('songs')
    .where('album_id', albumId)
    .max({ n: 'track_number' })
    .first()
  return Number(row?.n ?? 0) + 1
}

/** How many of these song ids belong to the author. */
export async function countSongsOwnedBy(
  authorId: number,
  songIds: number[],
): Promise<number> {
  if (!songIds.length) return 0
  const row = await db('songs')
    .where('author_id', authorId)
    .whereIn('id', songIds)
    .count({ n: '*' })
    .first()
  return Number(row?.n ?? 0)
}

/**
 * Makes `songIds` the album's full tracklist, in that order. Songs that were
 * in the album but aren't listed become singles; listed songs are moved out
 * of whatever album they were in. Callers must check the songs are the author's.
 */
export async function setAlbumTracks(albumId: number, songIds: number[]) {
  await db.transaction(async (trx) => {
    const dropped = trx('songs').where('album_id', albumId)
    if (songIds.length) dropped.whereNotIn('id', songIds)
    await dropped.update({ album_id: null, track_number: null })
    for (const [i, id] of songIds.entries()) {
      await trx('songs')
        .where('id', id)
        .update({ album_id: albumId, track_number: i + 1 })
    }
  })
}
