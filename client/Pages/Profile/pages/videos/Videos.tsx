import { useUserData } from '@/client/hooks'
import { Link, useParams } from 'react-router'
import { VideoCard } from './components/VideoCard'

export function Videos() {
  const { id } = useParams()

  const { data, isPending, isError, error, isSuccess } = useUserData(
    id ?? '',
    'videos',
  )

  console.log(data)

  if (isPending) {
    return <div>Loading...</div>
  }

  if (isError) {
    return <div>Error: {error.message}</div>
  }

  if (data.length == 0) {
    return 'True adam error (No videos)'
  }

  if (isSuccess) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {data.map((video) => (
          <VideoCard data={video} key={video.id} />
        ))}
      </div>
    )
  }
}
