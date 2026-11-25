import { useParams } from 'react-router'
import { CommentSection } from '@/client/components/CommentSection'

export function ProfileComments() {
  const { id } = useParams()

  return (
    <div>
      <h2 className="text-2xl mb-2">The warzone</h2>
      <CommentSection
        linkType="profile"
        linkId={id}
        composer="top"
        className="rounded-lg bg-[#00000075] p-3"
      />
    </div>
  )
}
