import request from 'superagent'
import type { post } from '../models/post'

export async function getPost(id: string | number): Promise<post> {
  const res = await request.get(`/api/v1/post/${id}`)
  return res.body
}
