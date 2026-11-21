import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Lightbox } from '../../util/Lightbok'
import { useComments } from '@/client/hooks'
import { ReactionBar } from '@/client/Pages/Util/Action'
import { CommentList } from './Comments'
import { Link, useNavigate } from 'react-router'

export function PostCard({
  id,
  title,
  username, // display name, shown above the @handle
  handle,
  avatar,
  date,
  body,
  image, // single image (still supported)
  images, // array of image URLs; takes priority over `image`
  alt, // string, or array of strings matching `images`
  sensitive = false,
  single = false, // true = standalone post page: one column, comments underneath
}) {
  let comments = []

  const {
    data: comments_got,
    isPending,
    isError,
    error,
  } = useComments(id, 'post')

  if (comments_got != null) {
    comments = comments_got
  }

  const [revealed, setRevealed] = useState(!sensitive)
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)

  const d = new Date(date)
  const displayName = username || handle

  // ---- images ----
  const imgs = images?.length ? images : image ? [image] : []
  const count = imgs.length
  const multi = count > 1
  const altFor = (i) => (Array.isArray(alt) ? alt[i] : alt) ?? ''

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

  const navigate = useNavigate()
  const postHref = `/posts/${id}`
  const profileHref = `/profile/${handle}`

  // Click anywhere on the card (list mode only) to open the post,
  // unless the click was on something interactive.
  function handleCardClick(e) {
    if (single) return
    if (e.defaultPrevented) return
    // ignore links, buttons, images (lightbox), form fields, and opted-out areas
    if (
      e.target.closest('a, button, img, input, textarea, select, [data-no-nav]')
    )
      return
    // don't navigate if the user was selecting text
    if (window.getSelection()?.toString()) return

    if (e.metaKey || e.ctrlKey) {
      window.open(postHref, '_blank')
    } else {
      navigate(postHref)
    }
  }

  const chevronClass =
    'absolute top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur transition hover:bg-black/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white disabled:pointer-events-none disabled:opacity-0'

  return (
    <div className="w-full min-w-0">
      <article
        onClick={handleCardClick}
        className={`grid w-full p-4 sm:p-6 ${
          single
            ? 'border border-zinc-800'
            : 'cursor-pointer transition hover:bg-black/40 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-4 md:rounded-2xl border border-white/8 backdrop-blur-md bg-black/30'
        }`}
      >
        {/* MAIN: header, text, image, actions (+ comments when single) */}
        <div className="min-w-0">
          <header className="mb-4 flex items-center gap-3">
            <Link to={profileHref} className="shrink-0">
              {avatar ? (
                <img
                  src={avatar}
                  alt=""
                  className="h-12 w-12 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10 text-lg font-semibold uppercase">
                  {displayName?.[0] ?? '?'}
                </div>
              )}
            </Link>
            <div className="min-w-0 leading-tight">
              <Link
                to={profileHref}
                className="flex min-w-0 items-baseline gap-2 hover:underline"
              >
                <span className="truncate font-semibold">{displayName}</span>
                {username && handle && (
                  <span className="truncate text-sm text-neutral-400">
                    @{handle}
                  </span>
                )}
              </Link>
              <time
                dateTime={d.toISOString()}
                className="text-sm text-neutral-500"
              >
                {d.toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
                {' at '}
                {d.toLocaleTimeString(undefined, {
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </time>
            </div>
          </header>

          <div
            className={`${single ? 'border-t border-zinc-800 pt-2' : 'rounded-xl bg-white/[.04] p-4'}`}
          >
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
                {imgs.map((img, i) => (
                  <img
                    key={i}
                    src={img.url}
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
          <footer className="mt-4 border-t border-white/[.08] pt-2">
            <ReactionBar type="post" id={id} />
          </footer>

          {/* SINGLE MODE: comments underneath, always visible */}
          {single && (
            <section className="mt-4 rounded-xl border border-white/[.08] bg-white/[.03] p-4">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-400">
                Comments ({comments.length})
              </h3>
              <CommentList comments={comments} single />
            </section>
          )}
        </div>

        {/* LIST MODE: comments in a side column (hidden below lg) */}
        {!single && (
          <aside
            data-no-nav
            className="relative hidden rounded-xl border border-white/[.08] bg-white/[.03] lg:block"
          >
            <div className="flex flex-col p-4 lg:absolute lg:inset-0">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-400">
                Comments ({comments.length})
              </h3>
              <CommentList comments={comments} single={false} />
            </div>
          </aside>
        )}
      </article>

      {open && count > 0 && (
        <Lightbox
          mode="post"
          postid={id}
          photos={imgs}
          index={index}
          onIndexChange={setIndex}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  )
}
