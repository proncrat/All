import { useParams } from 'react-router'
import { PostCard } from '../Profile/pages/posts/components/Post'

export function PostFull() {
  const { id } = useParams()
  return (
    <div className="flex justify-center">
      <div className="max-w-375">
        <PostCard
          single
          id={9}
          title={'Beans'}
          handle={'admin'}
          username={'God'}
          avatar={'/images/janedoe2.jpg'}
          body={'Some bull shit'}
          date={1235423623}
          images={[
            {
              id: 1,
              url: 'https://pbs.twimg.com/media/HVERTKrbIAAbjhL?format=jpg&name=small',
            },
            {
              id: 2,
              url: 'https://pbs.twimg.com/media/HVDIemuXgAALitQ?format=jpg&name=small',
            },
            {
              id: 3,
              url: 'https://pbs.twimg.com/media/HVFWAm2XAAAHBB5?format=jpg&name=small',
            },
            {
              id: 4,
              url: 'https://pbs.twimg.com/media/HVDvNrNXkAAEPGS?format=jpg&name=small',
            },
          ]}
          alt={
            'https://pbs.twimg.com/media/HVERTKrbIAAbjhL?format=jpg&name=small'
          }
        />
      </div>
    </div>
  )
}
