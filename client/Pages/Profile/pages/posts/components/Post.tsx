/*
export function PostCard(props) {
  return (
    <div className="rounded-xl bg-[#0a0a0a] p-4 ">
      <h2 className="text-2xl mb-2">{props.title}</h2>
      <p className="mb-2">{props.the_post}</p>
      <p>{new Date(props.post_date).toLocaleDateString()}</p>
      <img src="https://pbs.twimg.com/media/HVD3YYbawAAMKjE?format=jpg&name=small"></img>
    </div>
  )
}
*/

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Heart,
  MessageCircle,
  Repeat2,
  Share2,
  ThumbsDown,
} from 'lucide-react'

const fmt = (n) =>
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
}) {
  return (
    <button
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

export function PostCard({
  title,
  handle,
  avatar,
  date,
  body,
  image, // single image (still supported)
  images, // array of image URLs; takes priority over `image`
  alt, // string, or array of strings matching `images`
  sensitive = false,
  comments = [],
  initialLikes = 0,
  initialDislikes = 0,
  initialVote = null, // "like" | "dislike" | null
  initialReposts = null,
  initialSaves = null,
}) {
  const [revealed, setRevealed] = useState(!sensitive)
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)

  const [vote, setVote] = useState(initialVote)
  const [likes, setLikes] = useState(initialLikes)
  const [dislikes, setDislikes] = useState(initialDislikes)

  const [reposted, setReposted] = useState(false)
  const [reposts, setReposts] = useState(initialReposts) // add initialReposts = 0 to props
  const [saved, setSaved] = useState(false)
  const [saves, setSaves] = useState(initialSaves) // add initialSaves = 0 to props

  const d = new Date(date)

  // ---- images ----
  const imgs = images?.length ? images : image ? [image] : []
  const count = imgs.length
  const multi = count > 1
  const current = Math.min(index, Math.max(count - 1, 0))
  const altFor = (i) => (Array.isArray(alt) ? alt[i] : alt) ?? ''

  const prev = useCallback(() => setIndex((i) => Math.max(i - 1, 0)), [])
  const next = useCallback(
    () => setIndex((i) => Math.min(i + 1, count - 1)),
    [count],
  )

  // swipe support (carousel + lightbox)
  const touchX = useRef(null)
  const onTouchStart = (e) => {
    touchX.current = e.touches[0].clientX
  }
  const onTouchEnd = (e) => {
    if (touchX.current == null) return
    const dx = e.changedTouches[0].clientX - touchX.current
    touchX.current = null
    if (Math.abs(dx) < 40) return
    if (dx < 0) next()
    else prev()
  }

  // side-by-side carousel scrolling
  const scrollRef = useRef(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(false)

  const updateScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanLeft(el.scrollLeft > 4)
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }, [])

  useEffect(() => {
    updateScroll()
    const el = scrollRef.current
    if (!el) return
    const ro = new ResizeObserver(updateScroll)
    ro.observe(el)
    return () => ro.disconnect()
  }, [updateScroll, count, revealed])

  function scrollByPage(dir) {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' })
  }

  // keyboard nav while lightbox is open
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
      else if (e.key === 'ArrowLeft') prev()
      else if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, prev, next])

  function handleVote(type) {
    const prevState = { vote, likes, dislikes }

    // remove existing vote
    let nextLikes = likes - (vote === 'like' ? 1 : 0)
    let nextDislikes = dislikes - (vote === 'dislike' ? 1 : 0)
    let nextVote = null

    // apply new vote unless it was a toggle-off
    if (vote !== type) {
      nextVote = type
      if (type === 'like') nextLikes += 1
      else nextDislikes += 1
    }

    setVote(nextVote)
    setLikes(nextLikes)
    setDislikes(nextDislikes)

    // TODO: call your API here, and roll back on failure:
    // api.vote(postId, nextVote).catch(() => {
    //   setVote(prevState.vote); setLikes(prevState.likes); setDislikes(prevState.dislikes);
    // });
  }

  const chevronClass =
    'absolute top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur transition hover:bg-black/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white disabled:pointer-events-none disabled:opacity-0'

  return (
    <div className="w-full min-w-0">
      <article className="grid w-full rounded-2xl border border-white/8 backdrop-blur-md bg-black/30 p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-4">
        {/* LEFT: header, text, image, actions */}
        <div className="min-w-0">
          <header className="mb-4 flex items-center gap-3">
            {avatar ? (
              <img
                src={avatar}
                alt=""
                className="h-12 w-12 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10 text-lg font-semibold uppercase">
                {handle?.[0] ?? '?'}
              </div>
            )}
            <div className="min-w-0 leading-tight">
              <div className="truncate font-semibold">@{handle}</div>
              <time
                dateTime={d.toISOString()}
                className="text-sm text-neutral-500"
              >
                {d.toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </time>
            </div>
          </header>

          <div className="rounded-xl bg-white/[.04] p-4">
            {title && <h2 className="mb-1 text-xl font-semibold">{title}</h2>}
            <p className="whitespace-pre-line break-words leading-relaxed">
              {body}
            </p>
          </div>

          {count > 0 && (
            <div className="relative mt-4 overflow-hidden rounded-xl">
              <div
                ref={scrollRef}
                onScroll={updateScroll}
                className={
                  multi
                    ? `flex snap-x snap-mandatory gap-2 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
                        revealed ? 'overflow-x-auto' : 'overflow-hidden'
                      }`
                    : 'flex justify-center overflow-hidden bg-black'
                }
              >
                {imgs.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt={altFor(i)}
                    loading="lazy"
                    onLoad={updateScroll}
                    onClick={() => {
                      if (!revealed) return
                      setIndex(i)
                      setOpen(true)
                    }}
                    className={`block bg-black object-contain transition duration-300 ${
                      multi
                        ? 'h-[400px] w-auto max-w-none shrink-0 snap-start rounded-xl sm:h-[440px]'
                        : 'max-h-[500px] w-auto max-w-full'
                    } ${
                      revealed
                        ? 'cursor-zoom-in'
                        : 'scale-105 cursor-default blur-2xl'
                    }`}
                  />
                ))}
              </div>

              {multi && revealed && (
                <>
                  <button
                    type="button"
                    aria-label="Scroll left"
                    onClick={() => scrollByPage(-1)}
                    disabled={!canLeft}
                    className={`${chevronClass} left-3 h-10 w-10`}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Scroll right"
                    onClick={() => scrollByPage(1)}
                    disabled={!canRight}
                    className={`${chevronClass} right-3 h-10 w-10`}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}

              {!revealed && (
                <button
                  onClick={() => setRevealed(true)}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 text-sm font-medium text-white hover:bg-black/30"
                >
                  Sensitive content · Click to show
                </button>
              )}
            </div>
          )}

          {/* ACTION BAR */}
          <footer className="mt-4 flex items-center justify-between border-t border-white/[.08] pt-2">
            <ActionButton
              icon={MessageCircle}
              count={comments.length}
              label="Comments"
              hover="hover:text-sky-400"
            />

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
              onClick={() =>
                navigator.clipboard.writeText(window.location.href)
              }
            />
          </footer>
        </div>

        {/* RIGHT: comments (hidden below lg) */}
        <aside className="relative hidden rounded-xl border border-white/[.08] bg-white/[.03] lg:block">
          <div className="flex flex-col p-4 lg:absolute lg:inset-0">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-400">
              Comments ({comments.length})
            </h3>

            <ul className="flex-1 space-y-4 overflow-y-auto pr-1">
              {comments.length === 0 && (
                <li className="text-sm text-neutral-500">No comments yet.</li>
              )}
              {comments.map((c) => (
                <li key={c.id} className="flex gap-2">
                  {c.avatar ? (
                    <img
                      src={c.avatar}
                      alt=""
                      className="h-8 w-8 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold uppercase">
                      {c.handle?.[0] ?? '?'}
                    </div>
                  )}
                  <div className="min-w-0 text-sm">
                    <div>
                      <span className="font-semibold">@{c.handle}</span>{' '}
                      <span className="text-xs text-neutral-500">
                        {new Date(c.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="whitespace-pre-line break-words text-neutral-200">
                      {c.body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </article>

      {open && count > 0 && (
        <div
          onClick={() => setOpen(false)}
          onTouchStart={multi ? onTouchStart : undefined}
          onTouchEnd={multi ? onTouchEnd : undefined}
          className="fixed inset-0 z-50 flex cursor-zoom-out items-center justify-center bg-black/90 p-4"
        >
          <img
            src={imgs[current]}
            alt={altFor(current)}
            onClick={(e) => e.stopPropagation()}
            className="max-h-full max-w-full cursor-default object-contain"
          />

          {multi && (
            <>
              <button
                type="button"
                aria-label="Previous image"
                onClick={(e) => {
                  e.stopPropagation()
                  prev()
                }}
                disabled={current === 0}
                className={`${chevronClass} left-4 h-11 w-11`}
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                aria-label="Next image"
                onClick={(e) => {
                  e.stopPropagation()
                  next()
                }}
                disabled={current === count - 1}
                className={`${chevronClass} right-4 h-11 w-11`}
              >
                <ChevronRight className="h-6 w-6" />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-sm text-white">
                {current + 1} / {count}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
