import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import {
  Check,
  ListMusic,
  Lock,
  Pause,
  Pencil,
  Play,
  Plus,
  Trash2,
  X,
} from 'lucide-react'
import { usePlaylist, usePlaylistMutations } from '@/client/hooks/useplaylists'
import { useLibrary } from '@/client/hooks/usereactions'
import type { Playlist, PlaylistItem } from '@/client/apis/playlistsapi'
import { usePlayer } from '../Main/PlayerContext'
import { Spinner } from '../Util/SpinnerBox'
import { hrefFor, timeAgo, toSong } from '../Library/items'
import { Modal, PLAYLIST_TYPES, PlaylistForm } from './components'

const typeInfo = (t: Playlist['type']) =>
  PLAYLIST_TYPES.find((p) => p.type === t)!

/* ------------------------------------------------------------------ */
/* Item row                                                            */
/* ------------------------------------------------------------------ */

function ItemRow({
  item,
  index,
  playlist,
  isOwner,
}: {
  item: PlaylistItem
  index: number
  playlist: Playlist
  isOwner: boolean
}) {
  const { current, playing, playSong, toggle } = usePlayer()
  const { toggleItem } = usePlaylistMutations()
  const href = hrefFor(item)
  const Icon = typeInfo(playlist.type).Icon
  const title = item.title || 'Untitled'
  const isSong = item.type === 'song'
  const isThis = isSong && current?.id === item.id && current.src === item.media

  const play = () => {
    if (isThis) return toggle()
    const songs = playlist.items.filter((i) => i.media).map(toSong)
    playSong(toSong(item), songs)
  }

  const thumb = (
    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-white/5 sm:h-14 sm:w-20">
      {item.image ? (
        <img
          src={item.image}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="grid h-full place-items-center text-white/30">
          <Icon size={20} />
        </div>
      )}
    </div>
  )

  return (
    <li
      className={`group flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-white/5 ${
        isThis ? 'bg-white/5' : ''
      }`}
    >
      <span className="w-6 shrink-0 text-center text-sm tabular-nums text-white/40">
        {isSong ? (
          <button
            type="button"
            onClick={play}
            disabled={!item.media}
            aria-label={`${isThis && playing ? 'Pause' : 'Play'} ${title}`}
            className="grid h-6 w-6 cursor-pointer place-items-center text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isThis && playing ? (
              <Pause size={14} className="fill-current" />
            ) : (
              <>
                <span className="group-hover:hidden">
                  {isThis ? (
                    <Play size={14} className="fill-current text-lime-300" />
                  ) : (
                    <span className="text-white/40">{index + 1}</span>
                  )}
                </span>
                <Play
                  size={14}
                  className="hidden fill-current group-hover:block"
                />
              </>
            )}
          </button>
        ) : (
          index + 1
        )}
      </span>

      {href && !isSong ? (
        <Link to={href} tabIndex={-1} aria-hidden>
          {thumb}
        </Link>
      ) : (
        thumb
      )}

      <div className="min-w-0 flex-1">
        {href ? (
          <Link
            to={href}
            className={`line-clamp-1 text-sm font-medium hover:underline ${
              isThis ? 'text-lime-300' : ''
            }`}
          >
            {title}
          </Link>
        ) : (
          <p className="line-clamp-1 text-sm font-medium">{title}</p>
        )}
        {item.author && (
          <p className="truncate text-xs text-white/50">{item.author}</p>
        )}
        {item.type === 'post' && item.text && (
          <p className="line-clamp-1 text-xs text-white/40">{item.text}</p>
        )}
      </div>

      {item.runtime && (
        <span className="hidden text-xs tabular-nums text-white/40 sm:block">
          {item.runtime}
        </span>
      )}

      {isOwner && (
        <button
          type="button"
          onClick={() =>
            toggleItem.mutate({
              id: playlist.id,
              targetId: item.id,
              add: false,
            })
          }
          disabled={toggleItem.isPending}
          aria-label={`Remove ${title} from playlist`}
          className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-full text-white/40 opacity-100 transition hover:bg-white/10 hover:text-white sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
        >
          <X size={16} />
        </button>
      )}
    </li>
  )
}

/* ------------------------------------------------------------------ */
/* Add from library                                                    */
/* ------------------------------------------------------------------ */

function AddItemsModal({
  playlist,
  onClose,
}: {
  playlist: Playlist
  onClose: () => void
}) {
  const { data, isPending } = useLibrary()
  const { toggleItem } = usePlaylistMutations()
  const inPlaylist = new Set(playlist.items.map((i) => Number(i.id)))
  const label = typeInfo(playlist.type).label.toLowerCase()

  // Saved, liked and reposted items of this playlist's type, de-duplicated
  const candidates = useMemo(() => {
    if (!data) return []
    const seen = new Set<number>()
    return [...data.save, ...data.like, ...data.repost].filter((i) => {
      if (i.type !== playlist.type || seen.has(i.id)) return false
      seen.add(i.id)
      return true
    })
  }, [data, playlist.type])

  return (
    <Modal title={`Add ${label}`} onClose={onClose}>
      <p className="-mt-2 mb-3 text-sm text-white/50">
        From your saved, liked and reposted {label}. You can also use the
        playlist button on any {playlist.type}.
      </p>
      {isPending ? (
        <Spinner />
      ) : !candidates.length ? (
        <p className="py-8 text-center text-sm text-white/40">
          No saved or liked {label} yet.
        </p>
      ) : (
        <ul className="-mx-2 max-h-[60vh] space-y-1 overflow-y-auto">
          {candidates.map((item) => {
            const added = inPlaylist.has(Number(item.id))
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() =>
                    toggleItem.mutate({
                      id: playlist.id,
                      targetId: item.id,
                      add: !added,
                    })
                  }
                  disabled={toggleItem.isPending}
                  aria-pressed={added}
                  className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-white/5 disabled:cursor-wait"
                >
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md bg-white/5">
                    {item.image && (
                      <img
                        src={item.image}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-1 text-sm">
                      {item.title || 'Untitled'}
                    </span>
                    {item.author && (
                      <span className="block truncate text-xs text-white/50">
                        {item.author}
                      </span>
                    )}
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
    </Modal>
  )
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export function PlaylistPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: playlist, isPending, isError } = usePlaylist(id)
  const { update, remove } = usePlaylistMutations()
  const { current, playing, playSong, toggle } = usePlayer()
  const [modal, setModal] = useState<'edit' | 'add' | 'delete' | null>(null)

  if (isPending) return <Spinner />
  if (isError || !playlist) {
    return (
      <div className="py-24 text-center">
        <p className="text-lg font-medium">Playlist not found</p>
        <p className="mt-1 text-sm text-white/50">
          It may have been deleted or made private.
        </p>
        <Link
          to="/library?tab=playlists"
          className="mt-4 inline-block text-sm underline"
        >
          Back to your playlists
        </Link>
      </div>
    )
  }

  const isOwner = playlist.is_owner
  const info = typeInfo(playlist.type)
  const songs = playlist.items.filter((i) => i.type === 'song' && i.media)
  const playingThis =
    playing &&
    songs.some((s) => s.id === current?.id && s.media === current?.src)
  const updated = timeAgo(playlist.updated_at)

  const btn =
    'flex cursor-pointer items-center gap-1.5 rounded-full border border-white/20 px-4 py-2 text-sm transition-colors hover:border-white/60'

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 px-4 py-6 sm:px-6 sm:py-8">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-end">
        <div
          className={`relative w-48 shrink-0 overflow-hidden rounded-2xl bg-linear-to-br from-white/10 to-white/3 ring-1 ring-white/10 ${
            playlist.type === 'video' ? 'aspect-video sm:w-72' : 'aspect-square'
          }`}
        >
          {playlist.covers[0] ? (
            <img
              src={playlist.covers[0]}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="grid h-full place-items-center text-white/30">
              <info.Icon size={48} strokeWidth={1.5} />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <p className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-white/50">
            {playlist.is_private && <Lock size={12} aria-label="Private" />}
            {playlist.is_private ? 'Private' : 'Public'} playlist · {info.label}
          </p>
          <h1 className="wrap-break-word text-3xl font-bold sm:text-4xl">
            {playlist.title}
          </h1>
          {playlist.description && (
            <p className="whitespace-pre-line text-sm text-white/70">
              {playlist.description}
            </p>
          )}
          <p className="text-sm text-white/50">
            <Link
              to={`/profile/${playlist.owner_id}`}
              className="font-medium text-white/80 hover:underline"
            >
              {playlist.owner_name ?? 'Unknown'}
            </Link>
            {' · '}
            {playlist.count}{' '}
            {playlist.count === 1 ? playlist.type : `${playlist.type}s`}
            {updated && ` · Updated ${updated}`}
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            {playlist.type === 'song' && (
              <button
                type="button"
                disabled={!songs.length}
                onClick={() =>
                  playingThis
                    ? toggle()
                    : playSong(toSong(songs[0]), songs.map(toSong))
                }
                className="flex cursor-pointer items-center gap-1.5 rounded-full bg-lime-300 px-5 py-2 text-sm font-medium text-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                {playingThis ? (
                  <Pause size={16} className="fill-current" />
                ) : (
                  <Play size={16} className="fill-current" />
                )}
                {playingThis ? 'Pause' : 'Play all'}
              </button>
            )}
            {isOwner && (
              <>
                <button
                  type="button"
                  className={btn}
                  onClick={() => setModal('add')}
                >
                  <Plus size={16} /> Add {info.label.toLowerCase()}
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

      {playlist.items.length ? (
        <ol className="space-y-1">
          {playlist.items.map((item, i) => (
            <ItemRow
              key={item.id}
              item={item}
              index={i}
              playlist={playlist}
              isOwner={isOwner}
            />
          ))}
        </ol>
      ) : (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-white/15 px-4 py-12 text-center text-sm text-white/40">
          <ListMusic size={24} />
          This playlist is empty.
          {isOwner && (
            <button
              type="button"
              onClick={() => setModal('add')}
              className="mt-2 cursor-pointer text-white underline"
            >
              Add {info.label.toLowerCase()}
            </button>
          )}
        </div>
      )}

      {modal === 'add' && (
        <AddItemsModal playlist={playlist} onClose={() => setModal(null)} />
      )}

      {modal === 'edit' && (
        <Modal title="Edit playlist" onClose={() => setModal(null)}>
          <PlaylistForm
            initial={playlist}
            submitLabel="Save"
            pending={update.isPending}
            error={update.isError ? "Couldn't save changes." : null}
            onCancel={() => setModal(null)}
            onSubmit={({ title, description, is_private }) =>
              update.mutate(
                {
                  id: playlist.id,
                  changes: { title, description, is_private },
                },
                { onSuccess: () => setModal(null) },
              )
            }
          />
        </Modal>
      )}

      {modal === 'delete' && (
        <Modal title="Delete playlist?" onClose={() => setModal(null)}>
          <p className="text-sm text-white/70">
            &ldquo;{playlist.title}&rdquo; will be deleted. The{' '}
            {info.label.toLowerCase()} in it won&apos;t be affected.
          </p>
          {remove.isError && (
            <p className="mt-2 text-sm text-red-400">
              Couldn&apos;t delete it.
            </p>
          )}
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
                remove.mutate(playlist.id, {
                  onSuccess: () => navigate('/library?tab=playlists'),
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
