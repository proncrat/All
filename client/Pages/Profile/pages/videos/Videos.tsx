import { useUserData } from '@/client/hooks'
import { useParams } from 'react-router'
import { VideoCard } from './components/VideoCard'
import { videos } from '@/client/models/video'
import { Spinner } from '@/client/Pages/Util/SpinnerBox'

const GRID_CLASSES =
  'grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4 p-4'

export function Videos() {
  const { id } = useParams()

  const { data, isPending, isError, error } = useUserData(id ?? '', 'videos')

  if (isPending) {
    return <Spinner />
  }

  if (isError) {
    return <div className="p-4">Error: {error.message}</div>
  }

  if (data.length === 0) {
    return <div className="p-8 text-center opacity-70">No videos yet</div>
  }

  return (
    <div className={GRID_CLASSES}>
      {data.map((video: videos) => (
        <VideoCard data={video} key={video.id} />
      ))}
    </div>
  )
}
