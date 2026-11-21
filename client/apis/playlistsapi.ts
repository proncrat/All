import request from 'superagent'
import type { LibraryItem, ReactionTarget } from './reactionsapi'

const rootURL = new URL(`/api/v1/playlists`, document.baseURI)

export type PlaylistTarget = ReactionTarget

export interface PlaylistSummary {
  id: number
  owner_id: number
  owner_name: string | null
  title: string
  description: string | null
  type: PlaylistTarget
  is_private: boolean
  created_at: string | number
  updated_at: string | number
  count: number
  covers: string[]
  excerpt: string | null
}

export type PlaylistItem = Omit<LibraryItem, 'reacted_at'> & {
  added_at: string | number
}

export interface Playlist extends PlaylistSummary {
  items: PlaylistItem[]
  /** Whether the signed-in viewer owns this playlist. */
  is_owner: boolean
}

export interface NewPlaylist {
  title: string
  type: PlaylistTarget
  description?: string | null
  is_private?: boolean
}

export type PlaylistChanges = Partial<
  Pick<Playlist, 'title' | 'description' | 'is_private'>
>

export async function getMyPlaylists(
  type?: PlaylistTarget,
): Promise<PlaylistSummary[]> {
  const res = await request
    .get(`${rootURL}/me`)
    .query(type ? { type } : {})
    .withCredentials()
  return res.body
}

export async function getUserPlaylists(
  profileId: string | number,
): Promise<PlaylistSummary[]> {
  const res = await request
    .get(`${rootURL}/user/${encodeURIComponent(profileId)}`)
    .withCredentials()
  return res.body
}

export async function getPlaylist(id: string | number): Promise<Playlist> {
  const res = await request
    .get(`${rootURL}/${encodeURIComponent(id)}`)
    .withCredentials()
  return res.body
}

export async function getPlaylistsContaining(
  type: PlaylistTarget,
  targetId: string | number,
): Promise<number[]> {
  const res = await request
    .get(`${rootURL}/containing/${type}/${encodeURIComponent(targetId)}`)
    .withCredentials()
  return res.body
}

export async function createPlaylist(data: NewPlaylist): Promise<Playlist> {
  const res = await request.post(`${rootURL}`).withCredentials().send(data)
  return res.body
}

export async function updatePlaylist(
  id: number,
  changes: PlaylistChanges,
): Promise<Playlist> {
  const res = await request
    .put(`${rootURL}/${id}`)
    .withCredentials()
    .send(changes)
  return res.body
}

export async function deletePlaylist(id: number): Promise<void> {
  await request.delete(`${rootURL}/${id}`).withCredentials()
}

export async function addToPlaylist(
  id: number,
  targetId: string | number,
): Promise<Playlist> {
  const res = await request
    .post(`${rootURL}/${id}/items`)
    .withCredentials()
    .send({ target_id: Number(targetId) })
  return res.body
}

export async function removeFromPlaylist(
  id: number,
  targetId: string | number,
): Promise<Playlist> {
  const res = await request
    .delete(`${rootURL}/${id}/items/${encodeURIComponent(targetId)}`)
    .withCredentials()
  return res.body
}
