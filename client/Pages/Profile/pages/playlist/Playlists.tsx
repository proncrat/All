import { useUserData } from '@/client/hooks'
import { useParams } from 'react-router'
import { Spinner } from '@/client/Pages/Util/SpinnerBox'
import { PlaylistCard } from './Playlistcard'

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
      <PlaylistCard
        type="photos"
        title="Cosplay refs"
        count={48}
        covers={[
          '/images/f149d10f-dace-4439-b1ef-cd8d7a5213df.jfif',
          '/images/45f1d8f4-a5a5-49a5-979d-98b7a730cb65.jpg',
        ]}
        updatedAt="2 days ago"
        href="/p/1"
      />
      <PlaylistCard
        type="videos"
        title="Boss runs"
        count={12}
        covers={['https://i.ytimg.com/vi/bIsp1K8eJG0/maxresdefault.jpg']}
        href="/p/2"
      />
      <PlaylistCard
        type="posts"
        title="Patch notes"
        count={7}
        excerpt="Everything that changed in 1.4…"
        onClick={() => {}}
      />
      <PlaylistCard
        type="songs"
        title="Late night mix"
        count={31}
        covers={['/audio/deathwish.jfif']}
        isPrivate
      />
    </div>
  )
}
