//import { sendDataToClient } from '../Routes/test.ts'
import { sendDataToClient } from '../socket.ts'
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
  'profiledata.link_id',
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
  'messages.is_edited as edited',
  'profiledata.name',
  'profiledata.pfp',
]

export async function getmessages(chatId: string) {
  return await db('messages')
    .where('chatid', chatId)
    .select(get_messages_schema)
    .join('profiledata', 'messages.senderid', 'profiledata.id')
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

  // 2. everyone in this chat (both users, including the sender)
  const members = await db('chats') // <- your chats table name
    .where({ chatid: data.chatid })
    .distinct('ownerid')

  // 3. internal user id -> auth id (link_id), then emit to each user's room
  await Promise.all(
    members.map(async ({ ownerid }) => {
      const u = await getUnIdMatch(ownerid)
      if (!u?.link_id) {
        console.warn('[newmessage] no link_id for user', ownerid)
        return
      }
      console.log('[newmessage] emitting to user', ownerid, '->', u.link_id)
      sendDataToClient(u.link_id, saved)
    }),
  )

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
    .update({ is_edited: true, text: newText })
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
}

export async function newSong(data: NewSong) {
  const rows = await db('songs').insert(data).returning('id')
  return insertedId(rows)
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
        'posts.author_id',
        'profiledata.name as author',
      )
    ).map((r) => ({
      type,
      id: r.id,
      title: r.title,
      image: null,
      text: r.the_post,
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
      await base.select(
        'songs.id',
        'songs.name',
        'songs.cover',
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
