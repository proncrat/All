import request from 'superagent'
import type { Vote } from './reactionsapi'

const rootURL = new URL(`/api/v1/comments`, document.baseURI)

export interface NewComment {
  link_type: string
  link_id: string | number
  body_text: string
  parent_id?: number | null
}

export async function addComment(comment: NewComment) {
  const response = await request
    .post(`${rootURL}`)
    .withCredentials()
    .send(comment)
  return response.body
}

export async function deleteComment(id: number) {
  await request.delete(`${rootURL}/${id}`).withCredentials()
}

export async function voteComment(id: number, vote: Vote | null) {
  await request.put(`${rootURL}/${id}/vote`).withCredentials().send({ vote })
}
