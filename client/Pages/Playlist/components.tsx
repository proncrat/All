import { useId, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import {
  FileText,
  Image as ImageIcon,
  Lock,
  Music,
  Video,
  X,
} from 'lucide-react'
import type {
  Playlist,
  PlaylistSummary,
  PlaylistTarget,
} from '@/client/apis/playlistsapi'
import { usePlaylistMutations } from '@/client/hooks/useplaylists'
import { PlaylistCard } from '../Profile/pages/playlist/Playlistcard'
import { timeAgo } from '../Library/items'

export const PLAYLIST_TYPES: {
  type: PlaylistTarget
  label: string
  Icon: typeof Video
}[] = [
  { type: 'song', label: 'Songs', Icon: Music },
  { type: 'video', label: 'Videos', Icon: Video },
  { type: 'photo', label: 'Photos', Icon: ImageIcon },
  { type: 'post', label: 'Posts', Icon: FileText },
]

/** PlaylistCard uses plural type names. */
const cardType = (t: PlaylistTarget) => `${t}s` as const

/* ------------------------------------------------------------------ */
/* Modal                                                               */
/* ------------------------------------------------------------------ */

export function Modal({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: ReactNode
}) {
  const titleId = useId()

  // Portalled to <body> and above the photo lightbox (z-80). Keys and clicks
  // are stopped here so they don't also reach whatever opened the modal
  // (e.g. Escape or arrow keys closing / paging the lightbox).
  return createPortal(
    <div
      className="fixed inset-0 z-100 grid place-items-center bg-black/60 p-4 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        e.stopPropagation()
        if (e.key === 'Escape') onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-neutral-950 p-5 shadow-2xl"
      >
        <header className="mb-4 flex items-center justify-between">
          <h2 id={titleId} className="text-lg font-semibold">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-8 w-8 cursor-pointer place-items-center rounded-full text-white/60 hover:bg-white/10 hover:text-white"
          >
            <X size={18} />
          </button>
        </header>
        {children}
      </div>
    </div>,
    document.body,
  )
}

/* ------------------------------------------------------------------ */
/* Create / edit form                                                  */
/* ------------------------------------------------------------------ */

const field =
  'w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none transition-colors placeholder:text-white/30 focus:border-white/40'

export function PlaylistForm({
  initial,
  fixedType,
  submitLabel,
  pending,
  error,
  onSubmit,
  onCancel,
}: {
  initial?: Partial<
    Pick<Playlist, 'title' | 'description' | 'is_private' | 'type'>
  >
  /** Hide the type picker and use this type (e.g. when adding a specific item). */
  fixedType?: PlaylistTarget
  submitLabel: string
  pending?: boolean
  error?: string | null
  onSubmit: (v: {
    title: string
    description: string | null
    is_private: boolean
    type: PlaylistTarget
  }) => void
  onCancel?: () => void
}) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [isPrivate, setIsPrivate] = useState(initial?.is_private ?? false)
  const [type, setType] = useState<PlaylistTarget>(
    fixedType ?? initial?.type ?? 'song',
  )
  const ids = useId()
  // Type can't change after creation, so only show the picker for new playlists
  const showType = !fixedType && !initial?.type

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        if (!title.trim()) return
        onSubmit({
          title: title.trim(),
          description: description.trim() || null,
          is_private: isPrivate,
          type,
        })
      }}
    >
      <div className="space-y-1.5">
        <label htmlFor={`${ids}-title`} className="text-sm text-white/70">
          Title
        </label>
        <input
          id={`${ids}-title`}
          autoFocus
          required
          maxLength={100}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Late night mix"
          className={field}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor={`${ids}-desc`} className="text-sm text-white/70">
          Description <span className="text-white/40">(optional)</span>
        </label>
        <textarea
          id={`${ids}-desc`}
          rows={2}
          maxLength={1000}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={`${field} resize-none`}
        />
      </div>

      {showType && (
        <fieldset className="space-y-1.5">
          <legend className="mb-1.5 text-sm text-white/70">Holds</legend>
          <div className="grid grid-cols-4 gap-2">
            {PLAYLIST_TYPES.map(({ type: t, label, Icon }) => (
              <label
                key={t}
                className={`flex cursor-pointer flex-col items-center gap-1 rounded-lg border px-2 py-2.5 text-xs transition-colors has-focus-visible:outline-2 has-focus-visible:outline-lime-300 ${
                  type === t
                    ? 'border-lime-300 bg-lime-300/10 text-white'
                    : 'border-white/15 text-white/60 hover:border-white/40'
                }`}
              >
                <input
                  type="radio"
                  name={`${ids}-type`}
                  value={t}
                  checked={type === t}
                  onChange={() => setType(t)}
                  className="sr-only"
                />
                <Icon size={18} />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <label className="flex cursor-pointer items-center gap-2 text-sm text-white/80">
        <input
          type="checkbox"
          checked={isPrivate}
          onChange={(e) => setIsPrivate(e.target.checked)}
          className="h-4 w-4 accent-lime-300"
        />
        <Lock size={14} className="text-white/50" />
        Private: only you can see it
      </label>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex justify-end gap-2 pt-1">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="cursor-pointer rounded-full px-4 py-2 text-sm text-white/70 hover:bg-white/10"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={pending || !title.trim()}
          className="cursor-pointer rounded-full bg-lime-300 px-4 py-2 text-sm font-medium text-black transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  )
}

/** Modal that creates a playlist and calls onCreated with it. */
export function CreatePlaylistModal({
  fixedType,
  onClose,
  onCreated,
}: {
  fixedType?: PlaylistTarget
  onClose: () => void
  onCreated?: (p: Playlist) => void
}) {
  const { create } = usePlaylistMutations()
  return (
    <Modal title="New playlist" onClose={onClose}>
      <PlaylistForm
        fixedType={fixedType}
        submitLabel="Create"
        pending={create.isPending}
        error={create.isError ? "Couldn't create the playlist." : null}
        onCancel={onClose}
        onSubmit={(v) =>
          create.mutate(v, {
            onSuccess: (p) => {
              onCreated?.(p)
              onClose()
            },
          })
        }
      />
    </Modal>
  )
}

/* ------------------------------------------------------------------ */
/* Grid                                                                */
/* ------------------------------------------------------------------ */

export function PlaylistGrid({
  playlists,
  before,
}: {
  playlists: PlaylistSummary[]
  /** Rendered as the first grid cell, e.g. a "New playlist" tile. */
  before?: ReactNode
}) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
      {before}
      {playlists.map((p) => (
        <PlaylistCard
          key={p.id}
          type={cardType(p.type)}
          title={p.title}
          count={p.count}
          covers={p.covers}
          excerpt={p.excerpt ?? undefined}
          updatedAt={timeAgo(p.updated_at)}
          isPrivate={p.is_private}
          href={`/playlist/${p.id}`}
        />
      ))}
    </div>
  )
}
