import request from 'superagent'
const rootURL = new URL(`/api/v1`, document.baseURI)

export async function sendPhoto(data) {
  const requestURL = request.post(`${rootURL}/imgupload`)
  const response = await requestURL.send(data)
  return response.body
}

export async function deletePhoto(data) {
  const requestURL = request.delete(`${rootURL}/photo`)
  const response = await requestURL.send(data)
  return response.body
}

export interface Photo {
  id: string | number
  user_id: string
  created_at: string
  // ...your other columns
}

export interface PhotosPage {
  items: Photo[]
  nextCursor: string | null
}

interface GetPhotosParams {
  user_id: string
  limit?: number
  cursor?: string | null
  finger?: string
}

export async function getPhotos({
  user_id,
  limit = 30,
  cursor,
  finger,
}: GetPhotosParams): Promise<PhotosPage> {
  const response = await request
    .get(`${rootURL}/photo/improv/${encodeURIComponent(user_id)}`)
    .query({
      limit,
      ...(cursor ? { cursor } : {}), // omit on first request
      ...(finger ? { finger } : {}),
    })

  return response.body
}
