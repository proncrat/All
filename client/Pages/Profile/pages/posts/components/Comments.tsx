import { CommentSection } from '@/client/components/CommentSection'

export function CommentList({
  postId,
  single,
}: {
  postId: string | number
  single: boolean
}) {
  return single ? (
    <CommentSection linkType="post" linkId={postId} composer="top" />
  ) : (
    <CommentSection
      linkType="post"
      linkId={postId}
      className="flex-1"
      listClassName="flex-1 overflow-y-auto pr-1 pb-2"
    />
  )
}
