import { useUserData } from '@/client/hooks'
import { useParams } from 'react-router'
import { VideoCard } from './components/VideoCard'
import { videos } from '@/client/models/video'

function VideoCardSkeleton() {
  return (
    <div
      className="h-full overflow-hidden rounded-xl border border-white/20 bg-white/5"
      aria-hidden="true"
    >
      <div className="aspect-video w-full animate-pulse bg-white/10" />

      <div className="flex flex-col gap-2 p-3">
        <div className="h-4 w-4/5 animate-pulse rounded bg-white/10" />
        <div className="h-3 w-1/3 animate-pulse rounded bg-white/10" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-white/10" />
      </div>
    </div>
  )
}

const GRID_CLASSES =
  'grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4 p-4'

export function Videos() {
  const { id } = useParams()

  const { data, isPending, isError, error } = useUserData(id ?? '', 'videos')

  if (isPending) {
    return (
      <div className={GRID_CLASSES} role="status" aria-label="Loading videos">
        {Array.from({ length: 10 }, (_, i) => (
          <VideoCardSkeleton key={i} />
        ))}
      </div>
    )
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
