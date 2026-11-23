import { useUserData } from '@/client/hooks'
import { useParams } from 'react-router'
import { PostCard } from './components/Post'
import { post } from '@/client/models/post'
import { Spinner } from '@/client/Pages/Util/SpinnerBox'

export function Posts() {
  const { id } = useParams()
  const { data, isPending, isError, error } = useUserData(id ?? '', 'posts')
  // same query the profile page already made, so this is served from cache
  const { data: profile } = useUserData(id ?? '')

  if (isPending) {
    return <Spinner />
  }

  if (isError) {
    return <div>Error: {error.message}</div>
  }

  if (data.length == 0) {
    return 'True adam error (No posts)'
  }

  return (
    <div className="flex flex-col gap-0 md:gap-4 py-4 md:px-4">
      {data.map((item: post) => (
        <PostCard
          key={item.id}
          id={item.id}
          title={item.title}
          handle={profile?.name ?? 'unknown'}
          profileId={id}
          username={undefined}
          image={undefined}
          avatar={profile?.pfp}
          body={item.the_post}
          date={item.post_date}
          images={item.images ?? []}
          alt={item.title ?? ''}
        />
      ))}
    </div>
  )
}
