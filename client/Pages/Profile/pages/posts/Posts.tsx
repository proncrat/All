import { useUserData } from '@/client/hooks'
import { useParams } from 'react-router'
import { PostCard } from './components/Post'
import { post } from '@/client/models/post'
import { Spinner } from '@/client/Pages/Util/SpinnerBox'

export function Posts() {
  /*
  const { data, isPending, isError, error } = useComments(id, 'profile')

  const addcomment = useAddComment()

  const handleSubmit = async (e) => {
    e.preventDefault()

    const data = {
      link_type: 'profile',
      link_id: id,
      author_id: 1,
      body_text: e.target.text.value,
      post_date: new Date(),
    }

    await addcomment.mutateAsync(data)
  }
*/
  const { id } = useParams()
  const { data, isPending, isError, error } = useUserData(id ?? '', 'posts')

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
    <div className="flex flex-col gap-0 md:gap-4 px-0 md:px-4">
      {data.map((item: post) => (
        <PostCard
          key={item.id}
          id={item.id}
          title={item.title}
          handle={'God'}
          avatar={'/images/janedoe2.jpg'}
          body={item.the_post}
          date={item.post_date}
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
      ))}
    </div>
  )
}
