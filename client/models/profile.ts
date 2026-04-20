export interface profile {
  id: number
  link_id: null
  name: string
  describe: string
  followers: number
  peerid: string
  pfp: string
  description: string
}

export interface videos {
  id: number
  name: string
  description: string
  views: number
  author_id: number
  post_date: Date
  likes: number
  dislikes: number
  shares: number
  video_link: string
  thumbnail_link: string
}
