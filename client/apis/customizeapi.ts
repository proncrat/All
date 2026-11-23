import request from 'superagent'

const rootURL = new URL(`/api/v1/customize`, document.baseURI)

export interface ProfileData {
  id: number
  name: string
  describe: string | null
  description: string | null
  links: string | unknown[] | null
  pfp: string | null
  bg: string | null
  banner: string | null
}

/** Sends a multipart form (text fields + optional pfp/banner/bg files). */
export async function updateProfile(data: FormData): Promise<ProfileData> {
  const response = await request.put(`${rootURL}`).withCredentials().send(data)
  return response.body
}
