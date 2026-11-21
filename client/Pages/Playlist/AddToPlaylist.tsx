import { useState } from 'react'
import { Check, Lock, Plus } from 'lucide-react'
import {
  useMyPlaylists,
  usePlaylistMutations,
  usePlaylistsContaining,
} from '@/client/hooks/useplaylists'
import type { PlaylistTarget } from '@/client/apis/playlistsapi'
import { Spinner } from '../Util/SpinnerBox'
import { Modal, PLAYLIST_TYPES, PlaylistForm } from './components'

/**
 * Lists the viewer's playlists of the item's type with a toggle for each,
 * plus a way to make a new one that the item goes straight into.
 */
export function AddToPlaylistModal({
  type,
  targetId,
  onClose,
}: {
  type: PlaylistTarget
  targetId: string | number
  onClose: () => void
}) {
  const [creating, setCreating] = useState(false)
  const { data: playlists, isPending } = useMyPlaylists(type)
  const { data: containing } = usePlaylistsContaining(type, targetId)
  const { create, toggleItem } = usePlaylistMutations()
  const inSet = new Set(containing ?? [])
  const label = PLAYLIST_TYPES.find((t) => t.type === type)!.label.toLowerCase()

  if (creating) {
    return (
      <Modal title="New playlist" onClose={onClose}>
        <PlaylistForm
          fixedType={type}
          submitLabel="Create and add"
          pending={create.isPending || toggleItem.isPending}
          error={
            create.isError || toggleItem.isError
              ? "Couldn't create the playlist."
              : null
          }
          onCancel={() => setCreating(false)}
          onSubmit={(v) =>
            create.mutate(v, {
              onSuccess: (p) =>
                toggleItem.mutate(
                  { id: p.id, targetId, add: true },
                  { onSuccess: () => setCreating(false) },
                ),
            })
          }
        />
      </Modal>
    )
  }

  return (
    <Modal title="Save to playlist" onClose={onClose}>
      {isPending ? (
        <Spinner />
      ) : (
        <ul className="-mx-2 max-h-[50vh] space-y-1 overflow-y-auto">
          {!playlists?.length && (
            <li className="px-2 py-4 text-center text-sm text-white/40">
              You don&apos;t have any {label} playlists yet.
            </li>
          )}
          {playlists?.map((p) => {
            const added = inSet.has(p.id)
            return (
              <li key={p.id}>
                <button
                  type="button"
                  aria-pressed={added}
                  disabled={toggleItem.isPending}
                  onClick={() =>
                    toggleItem.mutate({ id: p.id, targetId, add: !added })
                  }
                  className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-white/5 disabled:cursor-wait"
                >
                  <span
                    className={`grid h-5 w-5 shrink-0 place-items-center rounded border ${
                      added
                        ? 'border-lime-300 bg-lime-300 text-black'
                        : 'border-white/30'
                    }`}
                  >
                    {added && <Check size={14} strokeWidth={3} />}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm">
                    {p.title}
                  </span>
                  {p.is_private && (
                    <Lock
                      size={12}
                      className="text-white/40"
                      aria-label="Private"
                    />
                  )}
                  <span className="text-xs tabular-nums text-white/40">
                    {p.count}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
      <button
        type="button"
        onClick={() => setCreating(true)}
        className="mt-3 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-full border border-white/20 py-2 text-sm transition-colors hover:border-white/60"
      >
        <Plus size={16} /> New playlist
      </button>
    </Modal>
  )
}
