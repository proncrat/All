import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { Spinner } from '@/client/Pages/Util/SpinnerBox'
import { useUserAlbums, useAlbumMutations } from '@/client/hooks/usealbums'
import { useFetchId } from '@/client/hooks/useId'
import { Modal } from '@/client/Pages/Playlist/components'
import { AlbumForm, AlbumGrid } from '@/client/Pages/Album/components'

/** Profile "Albums" tab. The profile's owner also gets a "New album" tile. */
export function Albums() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data, isPending, isError, error } = useUserAlbums(id)
  const { data: viewer } = useFetchId()
  const { create } = useAlbumMutations()
  const [creating, setCreating] = useState(false)
  const isOwner = viewer.userid != null && String(viewer.userid) === id

  if (isPending) return <Spinner />

  if (isError) {
    return <div className="p-4">Error: {error.message}</div>
  }

  return (
    <div className="p-4">
      {data.length === 0 && !isOwner ? (
        <div className="p-8 text-center opacity-70">No albums yet</div>
      ) : (
        <AlbumGrid
          albums={data}
          onCreate={isOwner ? () => setCreating(true) : undefined}
        />
      )}

      {creating && (
        <Modal title="New album" onClose={() => setCreating(false)}>
          <AlbumForm
            submitLabel="Create"
            pending={create.isPending}
            error={create.error?.message}
            onCancel={() => setCreating(false)}
            onSubmit={(input) =>
              create.mutate(input, {
                onSuccess: (album) => navigate(`/album/${album.id}`),
              })
            }
          />
        </Modal>
      )}
    </div>
  )
}
