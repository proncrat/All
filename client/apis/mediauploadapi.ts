import request from 'superagent'

const rootURL = new URL(`/api/v1/upload`, document.baseURI)

export type ProgressFn = (percent: number) => void

export interface VideoUploadResult {
  id: number
  video_link: string
  thumbnail_link: string | null
}

export interface SongUploadResult {
  id: number
  url: string
  cover: string | null
}

async function upload<T>(
  path: string,
  data: FormData,
  onProgress?: ProgressFn,
): Promise<T> {
  try {
    const response = await request
      .post(`${rootURL}/${path}`)
      .withCredentials()
      .on('progress', (e) => {
        if (e.direction === 'upload' && e.percent != null) {
          onProgress?.(Math.round(e.percent))
        }
      })
      .send(data)
    return response.body as T
  } catch (err) {
    // Surface the server's message (e.g. "Name is required") when it sent one
    const message = (err as { response?: { body?: { message?: string } } })
      .response?.body?.message
    throw new Error(message || 'Upload failed. Please try again.')
  }
}

export function uploadVideo(data: FormData, onProgress?: ProgressFn) {
  return upload<VideoUploadResult>('video', data, onProgress)
}

export function uploadSong(data: FormData, onProgress?: ProgressFn) {
  return upload<SongUploadResult>('song', data, onProgress)
}

export interface PostUploadResult {
  id: number
  images: string[]
}

export function uploadPost(data: FormData, onProgress?: ProgressFn) {
  return upload<PostUploadResult>('post', data, onProgress)
}
