import { useId, useState } from 'react'
import { Link } from 'react-router'
import { Disc3, ImagePlus, Plus } from 'lucide-react'
import type { Album, AlbumInput, AlbumSummary } from '@/client/apis/albumsapi'
import { useObjectUrl } from '../Post/components/uploadui'

const field =
  'w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none transition-colors placeholder:text-white/30 focus:border-white/40'

/** "2026" from "2026-03-14". */
export const releaseYear = (date: string | null) => date?.slice(0, 4) ?? null

/** "14 Mar 2026" from "2026-03-14" (parsed as a local date, not UTC). */
export function formatRelease(date: string | null) {
  if (!date) return null
  const [y, m, d] = date.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/** Square album cover, or a disc placeholder. */
export function AlbumCover({
  src,
  className = '',
  iconSize = 40,
}: {
  src: string | null | undefined
  className?: string
  iconSize?: number
}) {
  return (
    <div
      className={`aspect-square overflow-hidden rounded-xl bg-linear-to-br from-white/10 to-white/3 ring-1 ring-white/10 ${className}`}
    >
      {src ? (
        <img
          src={src}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="grid h-full place-items-center text-white/30">
          <Disc3 size={iconSize} strokeWidth={1.5} />
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Grid                                                                */
/* ------------------------------------------------------------------ */

export function AlbumGrid({
  albums,
  onCreate,
}: {
  albums: AlbumSummary[]
  /** Shows a "New album" tile first when given. */
  onCreate?: () => void
}) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4">
      {onCreate && (
        <button
          type="button"
          onClick={onCreate}
          className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/25 text-sm text-white/60 transition-colors hover:border-white/60 hover:text-white"
        >
          <Plus size={28} />
          New album
        </button>
      )}
      {albums.map((a) => (
        <Link
          key={a.id}
          to={`/album/${a.id}`}
          className="group min-w-0 space-y-2"
        >
          <AlbumCover
            src={a.cover}
            className="transition-transform group-hover:scale-[1.02]"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium group-hover:underline">
              {a.title}
            </p>
            <p className="truncate text-xs text-white/50">
              {[
                releaseYear(a.release_date),
                `${a.track_count} ${a.track_count === 1 ? 'song' : 'songs'}`,
              ]
                .filter(Boolean)
                .join(' · ')}
            </p>
          </div>
        </Link>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Create / edit form                                                  */
/* ------------------------------------------------------------------ */

export function AlbumForm({
  initial,
  submitLabel,
  pending,
  error,
  onSubmit,
  onCancel,
}: {
  initial?: Pick<Album, 'title' | 'description' | 'release_date' | 'cover'>
  submitLabel: string
  pending?: boolean
  error?: string | null
  onSubmit: (data: AlbumInput) => void
  onCancel?: () => void
}) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [releaseDate, setReleaseDate] = useState(initial?.release_date ?? '')
  const [cover, setCover] = useState<File | null>(null)
  const [removeCover, setRemoveCover] = useState(false)
  const ids = useId()

  const newCoverUrl = useObjectUrl(cover)
  const shownCover = newCoverUrl ?? (removeCover ? null : initial?.cover)

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        if (!title.trim()) return
        onSubmit({
          title: title.trim(),
          description: description.trim(),
          release_date: releaseDate,
          cover,
          remove_cover: removeCover,
        })
      }}
    >
      <div className="flex items-start gap-4">
        <label className="relative block w-28 shrink-0 cursor-pointer has-focus-visible:outline-2 has-focus-visible:outline-lime-300 rounded-xl">
          <AlbumCover src={shownCover} iconSize={28} />
          <span className="absolute inset-0 grid place-items-center rounded-xl bg-black/50 opacity-0 transition-opacity hover:opacity-100">
            <ImagePlus size={22} />
          </span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null
              setCover(file)
              if (file) setRemoveCover(false)
              e.target.value = ''
            }}
          />
          <span className="sr-only">Choose cover image</span>
        </label>

        <div className="min-w-0 flex-1 space-y-1.5">
          <label htmlFor={`${ids}-title`} className="text-sm text-white/70">
            Title
          </label>
          <input
            id={`${ids}-title`}
            autoFocus
            required
            maxLength={200}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Album title"
            className={field}
          />
          {shownCover && (
            <button
              type="button"
              onClick={() => {
                setCover(null)
                setRemoveCover(true)
              }}
              className="cursor-pointer text-xs text-white/50 underline hover:text-white"
            >
              Remove cover
            </button>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor={`${ids}-date`} className="text-sm text-white/70">
          Release date <span className="text-white/40">(optional)</span>
        </label>
        <input
          id={`${ids}-date`}
          type="date"
          value={releaseDate}
          onChange={(e) => setReleaseDate(e.target.value)}
          className={`${field} scheme-dark`}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor={`${ids}-desc`} className="text-sm text-white/70">
          Description <span className="text-white/40">(optional)</span>
        </label>
        <textarea
          id={`${ids}-desc`}
          rows={3}
          maxLength={2000}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={`${field} resize-none`}
        />
      </div>

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
