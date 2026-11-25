export interface comment {
  post_date: Date | string
  pfp: string
  body_text: string
  id: number
  parent_id: number | null
  name: string
  authorId: number
  likes: number
  dislikes: number
  vote: 'like' | 'dislike' | null
}
