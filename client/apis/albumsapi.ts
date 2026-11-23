import request from 'superagent'

const rootURL = new URL(`/api/v1/albums`, document.baseURI)

export interface AlbumSummary {
  id: number
  author_id: number
  author_name: string | null
  title: string
  description: string | null
  cover: string | null
  /** YYYY-MM-DD */
  release_date: string | null
  created_at: string | number
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
  /** The song's own cover, or the album's when it has none. */
  cover: string | null
}

export interface Album extends AlbumSummary {
  tracks: AlbumTrack[]
  /** Whether the signed-in viewer made this album. */
  is_owner: boolean
}

export interface AlbumInput {
  title?: string
  description?: string
  release_date?: string
  cover?: File | null
  /** Clears the current cover (ignored when a new cover is given). */
  remove_cover?: boolean
}

function toFormData(data: AlbumInput) {
  const form = new FormData()
  if (data.title !== undefined) form.append('title', data.title)
  if (data.description !== undefined)
    form.append('description', data.description)
  if (data.release_date !== undefined)
    form.append('release_date', data.release_date)
  if (data.cover) form.append('cover', data.cover)
  else if (data.remove_cover) form.append('remove_cover', 'true')
  return form
}

/** Rethrows with the server's message (e.g. "Title is required") when it sent one. */
function withMessage(err: unknown): never {
  const message = (err as { response?: { body?: { message?: string } } })
    .response?.body?.message
  throw new Error(message || 'Something went wrong. Please try again.')
}

export async function getUserAlbums(
  profileId: string | number,
): Promise<AlbumSummary[]> {
  const res = await request.get(
    `${rootURL}/user/${encodeURIComponent(profileId)}`,
  )
  return res.body
}

export async function getAlbum(id: string | number): Promise<Album> {
  const res = await request
    .get(`${rootURL}/${encodeURIComponent(id)}`)
    .withCredentials()
  return res.body
}

export async function createAlbum(data: AlbumInput): Promise<Album> {
  try {
    const res = await request
      .post(`${rootURL}`)
      .withCredentials()
      .send(toFormData(data))
    return res.body
  } catch (err) {
    withMessage(err)
  }
}

export async function updateAlbum(
  id: number,
  data: AlbumInput,
): Promise<Album> {
  try {
    const res = await request
      .put(`${rootURL}/${id}`)
      .withCredentials()
      .send(toFormData(data))
    return res.body
  } catch (err) {
    withMessage(err)
  }
}

export async function deleteAlbum(id: number): Promise<void> {
  await request.delete(`${rootURL}/${id}`).withCredentials()
}

/** Replaces the album's tracklist with these songs, in order. */
export async function setAlbumTracks(
  id: number,
  songIds: number[],
): Promise<Album> {
  try {
    const res = await request
      .put(`${rootURL}/${id}/tracks`)
      .withCredentials()
      .send({ song_ids: songIds })
    return res.body
  } catch (err) {
    withMessage(err)
  }
}
