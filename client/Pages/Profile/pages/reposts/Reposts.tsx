import { useParams } from 'react-router'
import { Spinner } from '@/client/Pages/Util/SpinnerBox'
import { useProfileReposts } from '@/client/hooks/usereactions'
import { Card } from '@/client/Pages/Library/Library'
import { PostCard } from '../posts/components/Post'
import type { LibraryItem, ReactionTarget } from '@/client/apis/reactionsapi'

const LABELS: Record<ReactionTarget, string> = {
  video: 'videos',
  post: 'posts',
  song: 'songs',
  photo: 'photos',
}

/** A reposted post, shown like on the Posts tab with a "Reposted" badge. */
function RepostedPost({ item }: { item: LibraryItem }) {
  return (
    <PostCard
      reposted
      id={item.id}
      title={item.title}
      handle={item.author ?? 'Unknown'}
      profileId={item.author_id}
      avatar={item.author_avatar}
      body={item.text}
      date={item.posted_at ?? item.reacted_at}
      username={undefined}
      image={undefined}
      images={undefined}
      alt={undefined}
    />
  )
}

/** Profile "Reposts" tab. `type` limits it to one kind of content. */
export function Reposts({ type }: { type?: ReactionTarget }) {
  const { id } = useParams()
  const { data, isPending, isError, error } = useProfileReposts(id, type)

  if (isPending) return <Spinner />

  if (isError) {
    return <div className="p-4">Error: {error.message}</div>
  }

  if (data.length === 0) {
    return (
      <div className="p-8 text-center opacity-70">
        No reposted {type ? LABELS[type] : 'anything'} yet
      </div>
    )
  }

  // Posts tab: same full-width list as the profile's Posts tab
  if (type === 'post') {
    return (
      <div className="flex flex-col gap-0 py-4 md:gap-4 md:px-4">
        {data.map((item) => (
          <RepostedPost key={item.id} item={item} />
        ))}
      </div>
    )
  }

  // Mixed / other types: grid of cards; posts span the full row
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 p-4">
      {data.map((item) =>
        item.type === 'post' ? (
          <div key={`post-${item.id}`} className="col-span-full">
            <RepostedPost item={item} />
          </div>
        ) : (
          <Card
            key={`${item.type}-${item.id}`}
            item={item}
            queue={data}
            className="w-full min-w-0"
          />
        ),
      )}
    </div>
  )
}
