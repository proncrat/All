import request from 'superagent'

const rootURL = new URL(`/api/v1/reactions`, document.baseURI)

export type ReactionTarget = 'video' | 'post' | 'photo' | 'song'
export type Vote = 'like' | 'dislike'

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

export interface UserReaction {
  target_type: ReactionTarget
  target_id: number
  created_at: string
}

const url = (type: ReactionTarget, id: string | number, action = '') =>
  `${rootURL}/${type}/${encodeURIComponent(id)}${action && `/${action}`}`

export async function getReactions(
  type: ReactionTarget,
  id: string | number,
): Promise<ReactionSummary> {
  const res = await request.get(url(type, id)).withCredentials()
  return res.body
}

export async function setVote(
  type: ReactionTarget,
  id: string | number,
  vote: Vote | null,
): Promise<ReactionSummary> {
  const res = await request
    .put(url(type, id, 'vote'))
    .withCredentials()
    .send({ vote })
  return res.body
}

export async function setFlag(
  type: ReactionTarget,
  id: string | number,
  kind: 'save' | 'repost',
  active: boolean,
): Promise<ReactionSummary> {
  const res = await request
    .put(url(type, id, kind))
    .withCredentials()
    .send({ active })
  return res.body
}

export async function getMyReactions(
  kind: Vote | 'save' | 'repost',
  type?: ReactionTarget,
): Promise<UserReaction[]> {
  const res = await request
    .get(`${rootURL}/me/${kind}`)
    .query(type ? { type } : {})
    .withCredentials()
  return res.body
}

export interface LibraryItem {
  type: ReactionTarget
  id: number
  title: string | null
  image: string | null
  author: string | null
  author_id: number | null
  text?: string | null
  media?: string | null
  runtime?: string | null
  posted_at?: string | number | null // posts
  author_avatar?: string | null // posts
  reacted_at: string | number
}

export type LibraryKind = Vote | 'save' | 'repost'
export type Library = Record<LibraryKind, LibraryItem[]>

export async function getLibrary(): Promise<Library> {
  const res = await request.get(`${rootURL}/library`).withCredentials()
  return res.body
}

/** Everything a profile has reposted (public), optionally one type. */
export async function getProfileReposts(
  profileId: string | number,
  type?: ReactionTarget,
): Promise<LibraryItem[]> {
  const res = await request
    .get(`${rootURL}/user/${encodeURIComponent(profileId)}/reposts`)
    .query(type ? { type } : {})
  return res.body
}
