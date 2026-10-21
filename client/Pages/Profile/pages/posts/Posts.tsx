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
          handle={'God'}
          avatar={'/images/janedoe2.jpg'}
          body={item.the_post}
          date={item.post_date}
          images={[
            'https://pbs.twimg.com/media/HVERTKrbIAAbjhL?format=jpg&name=small',
            'https://pbs.twimg.com/media/HVDIemuXgAALitQ?format=jpg&name=small',
            'https://pbs.twimg.com/media/HVFWAm2XAAAHBB5?format=jpg&name=small',
            'https://pbs.twimg.com/media/HVDvNrNXkAAEPGS?format=jpg&name=small',
          ]}
          alt={
            'https://pbs.twimg.com/media/HVERTKrbIAAbjhL?format=jpg&name=small'
          }
          comments={[
            {
              id: 1,
              handle: 'bob',
              avatar:
                'https://dk2dv4ezy246u.cloudfront.net/widgets/sSoFDYe3ZbPQ_large.jpg',
              date: '2026-03-24T14:30:00Z',
              body: 'nice one\nsecond line',
            },
            {
              id: 2,
              handle: 'alice',
              avatar: '/images/4cc1d0f3-a346-4359-91ca-6d1a76db487f.png',
              date: '2026-03-25T09:10:00Z',
              body: 'agreed',
            },
          ]}
        />
      ))}
    </div>
  )
}
