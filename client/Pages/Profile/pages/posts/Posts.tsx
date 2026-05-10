import { useUserData } from '@/client/hooks'
import { useParams } from 'react-router'
import { PostCard } from './components/Post'
import { post } from '@/client/models/post'

export function Posts() {
  const { id } = useParams()
  const { data, isPending, isError, error } = useUserData(id ?? '', 'posts')

  if (isPending) {
    return <div>Loading...</div>
  }

  if (isError) {
    return <div>Error: {error.message}</div>
  }

  if (data.length == 0) {
    return 'True adam error (No posts)'
  }

  return (
    <div className="flex flex-col gap-4">
      {data.map((item: post) => (
        <PostCard
          key={item.id}
          title={item.title}
          the_post={item.the_post}
          post_date={item.post_date}
        />
      ))}
    </div>
  )
}
