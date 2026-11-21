import { useState } from 'react'
import { useNavigate } from 'react-router'
import { ListMusic, Plus } from 'lucide-react'
import { useMyPlaylists } from '@/client/hooks/useplaylists'
import type { PlaylistTarget } from '@/client/apis/playlistsapi'
import { Spinner } from '../Util/SpinnerBox'
import {
  CreatePlaylistModal,
  PLAYLIST_TYPES,
  PlaylistGrid,
} from '../Playlist/components'

export function PlaylistsTab() {
  const [filter, setFilter] = useState<PlaylistTarget | 'all'>('all')
  const [creating, setCreating] = useState(false)
  const navigate = useNavigate()
  const { data, isPending, isError } = useMyPlaylists()

  const playlists = (data ?? []).filter(
    (p) => filter === 'all' || p.type === filter,
  )

  const chip = (active: boolean) =>
    `cursor-pointer rounded-full border px-3 py-1 text-sm transition-colors ${
      active
        ? 'border-white bg-white text-black'
        : 'border-white/20 text-white/70 hover:border-white/50'
    }`

  const newTile = (
    <button
      type="button"
      onClick={() => setCreating(true)}
      className="flex min-h-56 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/20 text-white/60 transition-colors hover:border-lime-300 hover:text-lime-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime-300"
    >
      <Plus size={28} />
      <span className="text-sm font-medium">New playlist</span>
    </button>
  )

  return (
    <section className="space-y-5 px-4 sm:px-6">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className={chip(filter === 'all')}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        {PLAYLIST_TYPES.map((t) => (
          <button
            key={t.type}
            type="button"
            className={chip(filter === t.type)}
            onClick={() => setFilter(t.type)}
          >
            {t.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="ml-auto flex cursor-pointer items-center gap-1.5 rounded-full bg-lime-300 px-4 py-1.5 text-sm font-medium text-black"
        >
          <Plus size={16} />
          New playlist
        </button>
      </div>

      {isPending ? (
        <Spinner />
      ) : isError ? (
        <p className="text-sm text-red-400">
          Couldn&apos;t load your playlists. Please try again.
        </p>
      ) : (
        <>
          <PlaylistGrid playlists={playlists} before={newTile} />
          {!data?.length && (
            <p className="flex items-center justify-center gap-2 py-6 text-center text-sm text-white/40">
              <ListMusic size={16} />
              Make a playlist, then add to it with the playlist button on any
              song, video, post or photo.
            </p>
          )}
        </>
      )}

      {creating && (
        <CreatePlaylistModal
          fixedType={filter === 'all' ? undefined : filter}
          onClose={() => setCreating(false)}
          onCreated={(p) => navigate(`/playlist/${p.id}`)}
        />
      )}
    </section>
  )
}
