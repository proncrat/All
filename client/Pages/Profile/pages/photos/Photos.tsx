import { Usesessionid, useComments, useUserData } from '@/client/hooks'
import { useAddComment, useDeleteComment } from '@/client/hooks/usecomments'
import { useDeletePhoto } from '@/client/hooks/useuploadphoto'
import { comment } from '@/client/models/comment'
import { useSession } from '@/lib/auth'
import {
  Bookmark,
  Heart,
  Repeat2,
  Send,
  Share2,
  ThumbsDown,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useParams } from 'react-router'

type Photo = {
  id: string | number
  url: string
  thumburl: string
  describe?: string
  // who posted it
  handle?: string
  avatar?: string
  date?: string
  // optional reaction data from your API
  likes?: number
  dislikes?: number
  vote?: 'like' | 'dislike' | null
  reposts?: number
  saves?: number
  reposted?: boolean
  saved?: boolean
}

const formatDate = (d: string | Date) =>
  new Date(d).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

const GRID_CLASS =
  'grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-2.5 py-3 px-4'

function PhotosSkeleton({ count = 6 }: { count?: number }) {
  return (
    <ul className={GRID_CLASS} aria-busy="true" aria-label="Loading photos">
      {Array.from({ length: count }, (_, i) => (
        <li
          key={i}
          className="aspect-square rounded-xl bg-muted shimmer shimmer-bg shimmer-color-neutral-600 shimmer-duration-1500"
        />
      ))}
    </ul>
  )
}

export function Photos() {
  const { id } = useParams()
  const { data, isPending, isError, error } = useUserData(id, 'photos')
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const close = useCallback(() => setActiveIndex(null), [])

  if (isPending) return <PhotosSkeleton />
  if (isError) return <div>Error: {error.message}</div>
  if (data.length === 0) return <div>True adam error (No photos)</div>

  return (
    <>
      <ul className={GRID_CLASS}>
        {data.map((item: Photo, i: number) => (
          <li
            key={item.id}
            onClick={() => setActiveIndex(i)}
            className="group aspect-square cursor-zoom-in overflow-hidden rounded-xl bg-white/5"
          >
            <img
              src={item.thumburl}
              alt={item.describe}
              loading="lazy"
              className="block h-full w-full object-cover transition duration-300 group-hover:scale-105 group-hover:brightness-110"
            />
          </li>
        ))}
      </ul>

      {activeIndex !== null && (
        <Lightbox
          photos={data as Photo[]}
          index={activeIndex}
          onIndexChange={setActiveIndex}
          onClose={close}
        />
      )}
    </>
  )
}

function Lightbox({
  photos,
  index,
  onIndexChange,
  onClose,
}: {
  photos: Photo[]
  index: number
  onIndexChange: (i: number) => void
  onClose: () => void
}) {
  const photo = photos[index]
  const hasPrev = index > 0
  const hasNext = index < photos.length - 1

  const [isMounted, setIsMounted] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    const raf = requestAnimationFrame(() => setIsMounted(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  const handleClose = useCallback(() => {
    if (isClosing) return
    setIsClosing(true)
    setTimeout(() => {
      onClose()
    }, 300) // Match transition duration (300ms)
  }, [isClosing, onClose])

  const poster = {
    handle: photo.handle ?? 'unknown',
    avatar: photo.avatar,
    date: photo.date,
  }

  const prev = useCallback(
    () => hasPrev && onIndexChange(index - 1),
    [hasPrev, index, onIndexChange],
  )
  const next = useCallback(
    () => hasNext && onIndexChange(index + 1),
    [hasNext, index, onIndexChange],
  )

  // Keyboard: Esc closes, arrows navigate (ignored while typing in the comment box)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return handleClose()
      const typing = (e.target as HTMLElement)?.tagName === 'INPUT'
      if (typing) return
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleClose, prev, next])

  // Lock page scroll while open
  useEffect(() => {
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [])

  const deletefoto = useDeletePhoto()

  async function deletePhoto(id: number | string) {
    await deletefoto.mutateAsync({ id })
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={photo.describe || 'Photo viewer'}
      className={`fixed inset-0 z-50 flex bg-black/85 backdrop-blur-sm transition-opacity duration-300 ${
        isMounted && !isClosing ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleClose}
    >
      {/* Close */}
      <button
        type="button"
        aria-label="Close"
        onClick={handleClose}
        className="absolute left-4 top-4 z-10 rounded-full bg-black/50 p-2 text-white/80 transition hover:bg-black/70 hover:text-white"
      >
        <X size={20} />
      </button>

      {/* Image area */}
      <div className="relative flex min-w-0 flex-1 items-center justify-center p-4 sm:p-10">
        {hasPrev && (
          <NavButton side="left" label="Previous photo" onClick={prev}>
            <ChevronLeft size={24} />
          </NavButton>
        )}

        <img
          key={photo.id}
          src={photo.url}
          alt={photo.describe}
          onClick={(e) => e.stopPropagation()}
          className={`max-h-full max-w-full rounded-lg object-contain shadow-2xl transition-all duration-300 ease-out ${
            isMounted && !isClosing
              ? 'opacity-100 scale-100'
              : 'opacity-0 scale-95'
          }`}
        />

        {hasNext && (
          <NavButton side="right" label="Next photo" onClick={next}>
            <ChevronRight size={24} />
          </NavButton>
        )}
      </div>

      {/* Comments panel (hidden on small screens) */}
      <aside
        onClick={(e) => e.stopPropagation()}
        className={`hidden w-[380px] shrink-0 flex-col border-l border-white/10 bg-black/80 text-white/90 md:flex transition-all duration-300 ease-out ${
          isMounted && !isClosing
            ? 'opacity-100 translate-x-0'
            : 'opacity-0 translate-x-6'
        }`}
      >
        {/* Poster */}
        <header className="flex items-center gap-3 px-5 pt-5">
          {poster.avatar ? (
            <img
              src={poster.avatar}
              alt=""
              className="h-12 w-12 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10 text-lg font-semibold uppercase">
              {poster.handle[0] ?? '?'}
            </div>
          )}
          <div className="min-w-0 leading-tight">
            <div className="truncate font-semibold text-white">
              @{poster.handle}
            </div>
            {poster.date && (
              <time
                dateTime={new Date(poster.date).toISOString()}
                className="text-sm text-neutral-500"
              >
                {formatDate(poster.date)}
              </time>
            )}
          </div>
          <div className="ml-auto flex shrink-0 items-center gap-1">
            <MoreOptionsMenu onDeletePhoto={() => deletePhoto(photo.id)} />
          </div>
        </header>

        {photo.describe && (
          <p className="border-b border-white/10 px-5 py-4 text-sm leading-relaxed">
            {photo.describe}
          </p>
        )}

        <ReactionBar key={`reactions-${photo.id}`} photo={photo} />
        <PhotoComments key={`comments-${photo.id}`} photoId={photo.id} />
      </aside>
    </div>,
    document.body,
  )
}

/* ---------- More options popup with Delete photo ---------- */
function MoreOptionsMenu({ onDeletePhoto }) {
  const [open, setOpen] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  const close = () => {
    setOpen(false)
    setConfirming(false)
  }

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node))
        close()
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const handleDelete = async () => {
    await onDeletePhoto?.()
    close()
  }

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => (open ? close() : setOpen(true))}
        aria-label="More options"
        aria-haspopup="menu"
        aria-expanded={open}
        className={`grid h-9 w-9 place-items-center rounded-full transition-colors hover:bg-neutral-800 hover:text-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 ${
          open ? 'bg-neutral-800 text-neutral-100' : 'text-neutral-500'
        }`}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="5" cy="12" r="1.8" />
          <circle cx="12" cy="12" r="1.8" />
          <circle cx="19" cy="12" r="1.8" />
        </svg>
      </button>

      <div
        role="menu"
        className={`absolute right-0 top-full z-20 mt-1.5 min-w-[200px] origin-top-right rounded-xl border border-neutral-800 bg-neutral-900 p-1.5 shadow-2xl shadow-black/60 transition duration-150 ${
          open
            ? 'scale-100 opacity-100'
            : 'pointer-events-none scale-95 opacity-0'
        }`}
      >
        {!confirming ? (
          <button
            type="button"
            role="menuitem"
            onClick={() => setConfirming(true)}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 10v6M14 10v6" />
            </svg>
            Delete photo
          </button>
        ) : (
          <div className="px-2 pb-1.5 pt-2">
            <p className="mb-2.5 text-[13px] leading-snug text-neutral-400">
              Delete this photo? This can't be undone.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="flex-1 rounded-lg bg-neutral-800 py-2 text-[13px] font-medium text-neutral-100 hover:bg-neutral-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="flex-1 rounded-lg bg-red-500 py-2 text-[13px] font-medium text-white hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function PhotoComments({ photoId }: { photoId: string | number }) {
  const addComment = useAddComment()
  const deleteComment = useDeleteComment()
  const { data: session } = useSession()
  const { data: currentUser } = Usesessionid(session?.session.userId)
  const { data, isPending, isError, error } = useComments(photoId, 'photo')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const text = (
      form.elements.namedItem('comment') as HTMLInputElement
    ).value.trim()
    if (!text) return

    await addComment.mutateAsync({
      link_type: 'photo',
      link_id: photoId,
      author_id: currentUser?.id,
      body_text: text,
      post_date: new Date(),
    })
    form.reset()
  }

  async function handleDelete(id: number) {
    await deleteComment.mutateAsync({ id })
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {isPending ? (
          <p className="mt-6 text-center text-sm text-white/40">
            Loading comments...
          </p>
        ) : isError ? (
          <p className="mt-6 text-center text-sm text-red-400">
            Error: {error.message}
          </p>
        ) : data.length === 0 ? (
          <p className="mt-6 text-center text-sm text-white/40">No comments</p>
        ) : (
          <ul className="space-y-4">
            {data.map((c: comment) => (
              <li key={c.id} className="group flex gap-3 text-sm">
                {c.pfp ? (
                  <img
                    src={c.pfp}
                    alt=""
                    className="h-9 w-9 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 font-semibold uppercase">
                    {c.name?.[0] ?? '?'}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="truncate font-semibold text-white">
                      {c.name}
                    </span>
                    <time
                      dateTime={new Date(c.post_date).toISOString()}
                      className="shrink-0 text-xs text-neutral-500"
                    >
                      {formatDate(c.post_date)}
                    </time>
                  </div>
                  <p className="mt-0.5 whitespace-pre-line break-words text-white/75">
                    {c.body_text}
                  </p>
                </div>
                {currentUser && currentUser.id === c.authorId && (
                  <button
                    type="button"
                    aria-label="Delete comment"
                    onClick={() => handleDelete(c.id)}
                    disabled={deleteComment.isPending}
                    className="h-fit shrink-0 rounded-full p-1.5 text-white/30 transition hover:bg-white/10 hover:text-red-400 disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <form
        className="flex items-center gap-2 border-t border-white/10 p-3"
        onSubmit={handleSubmit}
      >
        <input
          name="comment"
          placeholder={currentUser ? 'Add a comment' : 'Sign in to comment'}
          disabled={!currentUser}
          autoComplete="off"
          className="min-w-0 flex-1 rounded-full bg-white/5 px-4 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
        />
        <button
          type="submit"
          aria-label="Post comment"
          disabled={!currentUser || addComment.isPending}
          className="rounded-full p-2 text-white/60 transition hover:bg-white/10 hover:text-white disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-white/60"
        >
          <Send size={18} />
        </button>
      </form>
    </>
  )
}

function NavButton({
  side,
  label,
  onClick,
  children,
}: {
  side: 'left' | 'right'
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className={`absolute top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white/80 transition hover:bg-black/70 hover:text-white ${
        side === 'left' ? 'left-3' : 'right-3'
      }`}
    >
      {children}
    </button>
  )
}

const fmt = (n: number) =>
  new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(n)

function ActionButton({
  icon: Icon,
  count,
  label,
  active,
  hover,
  activeColor,
  fill,
  onClick,
}: {
  icon: LucideIcon
  count?: number
  label: string
  active?: boolean
  hover: string
  activeColor?: string
  fill?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={`group flex items-center gap-1 text-[13px] transition-colors ${
        active ? activeColor : `text-neutral-500 ${hover}`
      }`}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full transition-colors group-hover:bg-current/10">
        <Icon
          size={18}
          strokeWidth={1.75}
          className={active && fill ? 'fill-current' : ''}
        />
      </span>
      {count !== undefined && (
        <span className="min-w-[3ch] text-left tabular-nums">{fmt(count)}</span>
      )}
    </button>
  )
}

function ReactionBar({ photo }: { photo: Photo }) {
  const [vote, setVote] = useState<'like' | 'dislike' | null>(
    photo.vote ?? null,
  )
  const [likes, setLikes] = useState(photo.likes ?? 0)
  const [dislikes, setDislikes] = useState(photo.dislikes ?? 0)

  const [reposted, setReposted] = useState(photo.reposted ?? false)
  const [reposts, setReposts] = useState(photo.reposts ?? 0)
  const [saved, setSaved] = useState(photo.saved ?? false)
  const [saves, setSaves] = useState(photo.saves ?? 0)

  function handleVote(type: 'like' | 'dislike') {
    let nextLikes = likes - (vote === 'like' ? 1 : 0)
    let nextDislikes = dislikes - (vote === 'dislike' ? 1 : 0)
    let nextVote: 'like' | 'dislike' | null = null

    if (vote !== type) {
      nextVote = type
      if (type === 'like') nextLikes += 1
      else nextDislikes += 1
    }

    setVote(nextVote)
    setLikes(nextLikes)
    setDislikes(nextDislikes)
  }

  return (
    <div className="flex items-center justify-between border-b border-white/10 px-5 py-2">
      <ActionButton
        icon={Repeat2}
        count={reposts}
        label="Repost"
        active={reposted}
        activeColor="text-emerald-400"
        hover="hover:text-emerald-400"
        onClick={() => {
          setReposted(!reposted)
          setReposts(reposts + (reposted ? -1 : 1))
        }}
      />

      <ActionButton
        icon={Heart}
        count={likes}
        label="Like"
        active={vote === 'like'}
        activeColor="text-pink-500"
        hover="hover:text-pink-500"
        fill
        onClick={() => handleVote('like')}
      />

      <ActionButton
        icon={ThumbsDown}
        count={dislikes}
        label="Dislike"
        active={vote === 'dislike'}
        activeColor="text-orange-400"
        hover="hover:text-orange-400"
        fill
        onClick={() => handleVote('dislike')}
      />

      <ActionButton
        icon={Bookmark}
        count={saves}
        label="Save"
        active={saved}
        activeColor="text-sky-400"
        hover="hover:text-sky-400"
        fill
        onClick={() => {
          setSaved(!saved)
          setSaves(saves + (saved ? -1 : 1))
        }}
      />

      <ActionButton
        icon={Share2}
        label="Share"
        hover="hover:text-sky-400"
        onClick={() => navigator.clipboard.writeText(window.location.href)}
      />
    </div>
  )
}
