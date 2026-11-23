import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import {
  ArrowDown,
  ArrowUp,
  Check,
  Pause,
  Pencil,
  Play,
  Plus,
  Trash2,
  X,
} from 'lucide-react'
import { useAlbum, useAlbumMutations } from '@/client/hooks/usealbums'
import { useUserData } from '@/client/hooks'
import type { Album, AlbumTrack } from '@/client/apis/albumsapi'
import { usePlayer, type Song } from '../Main/PlayerContext'
import { Spinner } from '../Util/SpinnerBox'
import { Modal } from '../Playlist/components'
import { AlbumCover, AlbumForm, formatRelease } from './components'

const toSong = (t: AlbumTrack): Song => ({
  id: t.id,
  title: t.name,
  artist: t.author,
  src: t.url,
  cover: t.cover ?? undefined,
})

/* ------------------------------------------------------------------ */
/* Track row                                                           */
/* ------------------------------------------------------------------ */

function TrackRow({
  track,
  index,
  album,
}: {
  track: AlbumTrack
  index: number
  album: Album
}) {
  const { current, playing, playSong, toggle } = usePlayer()
  const { setTracks } = useAlbumMutations()
  const isThis = current?.id === track.id && current.src === track.url
  const ids = album.tracks.map((t) => t.id)

  const play = () =>
    isThis ? toggle() : playSong(toSong(track), album.tracks.map(toSong))

  /** Swaps this track with the one `by` places away. */
  const move = (by: -1 | 1) => {
    const next = [...ids]
    const j = index + by
    ;[next[index], next[j]] = [next[j], next[index]]
    setTracks.mutate({ id: album.id, songIds: next })
  }

  const ownerBtn =
    'grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-full text-white/40 transition hover:bg-white/10 hover:text-white disabled:pointer-events-none disabled:opacity-20'

  return (
    <li
      className={`group flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-white/5 ${
        isThis ? 'bg-white/5' : ''
      }`}
    >
      <button
        type="button"
        onClick={play}
        aria-label={`${isThis && playing ? 'Pause' : 'Play'} ${track.name}`}
        className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center text-sm tabular-nums text-white/40"
      >
        {isThis && playing ? (
          <Pause size={14} className="fill-current text-white" />
        ) : (
          <>
            <span className="group-hover:hidden">
              {isThis ? (
                <Play size={14} className="fill-current text-lime-300" />
              ) : (
                index + 1
              )}
            </span>
            <Play
              size={14}
              className="hidden fill-current text-white group-hover:block"
            />
          </>
        )}
      </button>

      <div className="min-w-0 flex-1">
        <p
          className={`line-clamp-1 text-sm font-medium ${
            isThis ? 'text-lime-300' : ''
          }`}
        >
          {track.name}
        </p>
        {track.author !== album.author_name && (
          <p className="truncate text-xs text-white/50">{track.author}</p>
        )}
      </div>

      <span className="text-xs tabular-nums text-white/40">
        {track.runtime}
      </span>

      {album.is_owner && (
        <div className="flex shrink-0 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
          <button
            type="button"
            className={ownerBtn}
            disabled={index === 0 || setTracks.isPending}
            onClick={() => move(-1)}
            aria-label={`Move ${track.name} up`}
          >
            <ArrowUp size={16} />
          </button>
          <button
            type="button"
            className={ownerBtn}
            disabled={index === ids.length - 1 || setTracks.isPending}
            onClick={() => move(1)}
            aria-label={`Move ${track.name} down`}
          >
            <ArrowDown size={16} />
          </button>
          <button
            type="button"
            className={ownerBtn}
            disabled={setTracks.isPending}
            onClick={() =>
              setTracks.mutate({
                id: album.id,
                songIds: ids.filter((id) => id !== track.id),
              })
            }
            aria-label={`Remove ${track.name} from album`}
          >
            <X size={16} />
          </button>
        </div>
      )}
    </li>
  )
}

/* ------------------------------------------------------------------ */
/* Add songs                                                           */
/* ------------------------------------------------------------------ */

interface OwnSong {
  id: number
  name: string
  runtime: string
  cover: string | null
  album_id: number | null
  album_title: string | null
}

function AddSongsModal({
  album,
  onClose,
}: {
  album: Album
  onClose: () => void
}) {
  const { data, isPending } = useUserData(String(album.author_id), 'songs')
  const { setTracks } = useAlbumMutations()
  const ids = album.tracks.map((t) => t.id)
  const inAlbum = new Set(ids)
  const songs = (data ?? []) as OwnSong[]

  const toggle = (id: number) =>
    setTracks.mutate({
      id: album.id,
      songIds: inAlbum.has(id) ? ids.filter((x) => x !== id) : [...ids, id],
    })

  return (
    <Modal title="Add songs" onClose={onClose}>
      <p className="-mt-2 mb-3 text-sm text-white/50">
        Pick from songs you&apos;ve uploaded. Adding a song that&apos;s in
        another album moves it here.
      </p>
      {isPending ? (
        <Spinner />
      ) : !songs.length ? (
        <p className="py-8 text-center text-sm text-white/40">
          You haven&apos;t uploaded any songs yet.
        </p>
      ) : (
        <ul className="-mx-2 max-h-[60vh] space-y-1 overflow-y-auto">
          {songs.map((song) => {
            const added = inAlbum.has(song.id)
            const elsewhere = !added && song.album_id ? song.album_title : null
            return (
              <li key={song.id}>
                <button
                  type="button"
                  onClick={() => toggle(song.id)}
                  disabled={setTracks.isPending}
                  aria-pressed={added}
                  className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-white/5 disabled:cursor-wait"
                >
                  <AlbumCover
                    src={song.cover}
                    iconSize={16}
                    className="w-10 shrink-0 rounded-md!"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-1 text-sm">{song.name}</span>
                    <span className="block truncate text-xs text-white/50">
                      {elsewhere ? `In ${elsewhere} · ` : ''}
                      {song.runtime}
                    </span>
                  </span>
                  <span
                    className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border ${
                      added
                        ? 'border-lime-300 bg-lime-300 text-black'
                        : 'border-white/30 text-white/60'
                    }`}
                  >
                    {added ? <Check size={14} /> : <Plus size={14} />}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
      {setTracks.isError && (
        <p className="mt-3 text-sm text-red-400">{setTracks.error.message}</p>
      )}
    </Modal>
  )
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

/** Total length of "m:ss" / "h:mm:ss" runtimes, as "1 hr 4 min" or "38 min". */
function totalLength(tracks: AlbumTrack[]) {
  const secs = tracks.reduce(
    (sum, t) =>
      sum +
      (t.runtime ?? '')
        .split(':')
        .reduce((acc, part) => acc * 60 + (Number(part) || 0), 0),
    0,
  )
  if (!secs) return null
  const h = Math.floor(secs / 3600)
  const m = Math.round((secs % 3600) / 60)
  return h ? `${h} hr ${m} min` : `${Math.max(m, 1)} min`
}

export function AlbumPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: album, isPending, isError } = useAlbum(id)
  const { update, remove } = useAlbumMutations()
  const { current, playing, playSong, toggle } = usePlayer()
  const [modal, setModal] = useState<'edit' | 'add' | 'delete' | null>(null)

  if (isPending) return <Spinner />
  if (isError || !album) {
    return (
      <div className="py-24 text-center">
        <p className="text-lg font-medium">Album not found</p>
        <p className="mt-1 text-sm text-white/50">It may have been deleted.</p>
      </div>
    )
  }

  const playingThis =
    playing &&
    album.tracks.some((t) => t.id === current?.id && t.url === current?.src)
  const length = totalLength(album.tracks)
  const released = formatRelease(album.release_date)

  const btn =
    'flex cursor-pointer items-center gap-1.5 rounded-full border border-white/20 px-4 py-2 text-sm transition-colors hover:border-white/60'

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 px-4 py-6 sm:px-6 sm:py-8">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-end">
        <AlbumCover
          src={album.cover}
          iconSize={56}
          className="w-48 shrink-0 rounded-2xl sm:w-56"
        />

        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-xs uppercase tracking-wider text-white/50">
            Album
          </p>
          <h1 className="wrap-break-word text-3xl font-bold sm:text-4xl">
            {album.title}
          </h1>
          {album.description && (
            <p className="whitespace-pre-line text-sm text-white/70">
              {album.description}
            </p>
          )}
          <p className="text-sm text-white/50">
            <Link
              to={`/profile/${album.author_id}`}
              className="font-medium text-white/80 hover:underline"
            >
              {album.author_name ?? 'Unknown'}
            </Link>
            {released && ` · ${released}`}
            {' · '}
            {album.track_count} {album.track_count === 1 ? 'song' : 'songs'}
            {length && `, ${length}`}
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            <button
              type="button"
              disabled={!album.tracks.length}
              onClick={() =>
                playingThis
                  ? toggle()
                  : playSong(toSong(album.tracks[0]), album.tracks.map(toSong))
              }
              className="flex cursor-pointer items-center gap-1.5 rounded-full bg-lime-300 px-5 py-2 text-sm font-medium text-black disabled:cursor-not-allowed disabled:opacity-50"
            >
              {playingThis ? (
                <Pause size={16} className="fill-current" />
              ) : (
                <Play size={16} className="fill-current" />
              )}
              {playingThis ? 'Pause' : 'Play'}
            </button>
            {album.is_owner && (
              <>
                <button
                  type="button"
                  className={btn}
                  onClick={() => setModal('add')}
                >
                  <Plus size={16} /> Add songs
                </button>
                <button
                  type="button"
                  className={btn}
                  onClick={() => setModal('edit')}
                >
                  <Pencil size={14} /> Edit
                </button>
                <button
                  type="button"
                  className={`${btn} hover:border-red-400 hover:text-red-400`}
                  onClick={() => setModal('delete')}
                >
                  <Trash2 size={14} /> Delete
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {album.tracks.length ? (
        <ol className="space-y-1">
          {album.tracks.map((track, i) => (
            <TrackRow key={track.id} track={track} index={i} album={album} />
          ))}
        </ol>
      ) : (
        <div className="rounded-2xl border border-dashed border-white/15 py-16 text-center text-sm text-white/50">
          {album.is_owner
            ? 'No songs yet. Add songs you’ve uploaded, or pick this album when uploading a new one.'
            : 'No songs in this album yet.'}
        </div>
      )}

      {modal === 'add' && (
        <AddSongsModal album={album} onClose={() => setModal(null)} />
      )}

      {modal === 'edit' && (
        <Modal title="Edit album" onClose={() => setModal(null)}>
          <AlbumForm
            initial={album}
            submitLabel="Save"
            pending={update.isPending}
            error={update.error?.message}
            onCancel={() => setModal(null)}
            onSubmit={(data) =>
              update.mutate(
                { id: album.id, data },
                { onSuccess: () => setModal(null) },
              )
            }
          />
        </Modal>
      )}

      {modal === 'delete' && (
        <Modal title="Delete album?" onClose={() => setModal(null)}>
          <p className="text-sm text-white/70">
            “{album.title}” will be deleted. Its songs stay on your profile as
            singles.
          </p>
          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setModal(null)}
              className="cursor-pointer rounded-full px-4 py-2 text-sm text-white/70 hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={remove.isPending}
              onClick={() =>
                remove.mutate(album.id, {
                  onSuccess: () =>
                    navigate(`/profile/${album.author_id}/albums`, {
                      replace: true,
                    }),
                })
              }
              className="cursor-pointer rounded-full bg-red-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {remove.isPending ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
