import { useUserData } from '@/client/hooks'
import { useParams } from 'react-router'
import { videos } from '@/client/models/video'
import { Playlistcard } from './Playlistcard'
import { Spinner } from '@/client/Pages/Util/SpinnerBox'

//change

const GRID_CLASSES =
  'grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4 p-4'

export function Playlist() {
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
        <Playlistcard data={video} key={video.id} />
      ))}
    </div>
  )
}
