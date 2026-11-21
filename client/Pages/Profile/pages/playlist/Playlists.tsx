import { useParams } from 'react-router'
import { Spinner } from '@/client/Pages/Util/SpinnerBox'
import { useUserPlaylists } from '@/client/hooks/useplaylists'
import { PlaylistGrid } from '@/client/Pages/Playlist/components'

/** Profile "Playlists" tab: the user's public playlists (and private ones, for the owner). */
export function Playlist() {
  const { id } = useParams()
  const { data, isPending, isError, error } = useUserPlaylists(id)

  if (isPending) return <Spinner />

  if (isError) {
    return <div className="p-4">Error: {error.message}</div>
  }

  if (data.length === 0) {
    return <div className="p-8 text-center opacity-70">No playlists yet</div>
  }

  return (
    <div className="p-4">
      <PlaylistGrid playlists={data} />
    </div>
  )
}
