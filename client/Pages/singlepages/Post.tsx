import { useParams } from 'react-router'
import { PostCard } from '../Profile/pages/posts/components/Post'
import { usePost } from '@/client/hooks/usepost'
import { Spinner } from '@/client/Pages/Util/SpinnerBox'

export function PostFull() {
  const { id } = useParams()
  const { data: post, isPending, isError } = usePost(id)

  if (isPending) return <Spinner />
  if (isError || !post)
    return <div className="p-8 text-center text-white/60">Post not found</div>

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-375">
        <PostCard
          single
          id={post.id}
          title={post.title}
          handle={post.handle ?? 'unknown'}
          username={undefined}
          image={undefined}
          profileId={post.author_id}
          avatar={post.avatar}
          body={post.the_post}
          date={post.post_date}
          images={post.images ?? []}
          alt={post.title ?? ''}
        />
      </div>
    </div>
  )
}
