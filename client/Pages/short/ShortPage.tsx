import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { X } from 'lucide-react'
import { useComments, useUserData } from '@/client/hooks'
import { getVideosById } from '@/client/api'
import { Spinner } from '@/client/Pages/Util/SpinnerBox'
import { ReactionBar } from '@/client/Pages/Util/Action'
import { CommentSection } from '@/client/components/CommentSection'
import { Shortz } from './shortz'

const videoQuery = (id: string) => ({
  queryKey: ['video', id],
  queryFn: () => getVideosById(id),
})

/**
 * /shortz/:id — plays one short in the vertical player. Scrolling, swiping
 * or ↑/↓ moves through the rest of the author's shorts, in the same order
 * as their profile's Shorts tab.
 */
export function ShortPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Keep showing the current short while the next one loads (no spinner flash)
  const { data, isPending, isError, error } = useQuery({
    ...videoQuery(id),
    placeholderData: keepPreviousData,
  })
  const [commentsOpen, setCommentsOpen] = useState(false)

  // The author's shorts, newest first (same list/cache as the profile tab)
  const authorId = data?.author_id != null ? String(data.author_id) : ''
  const { data: list } = useUserData(authorId, 'shorts', Boolean(authorId))
  const ids: string[] = Array.isArray(list)
    ? list.map((v: { id: number }) => String(v.id))
    : []
  const index = ids.indexOf(id)
  const prevId = index > 0 ? ids[index - 1] : null
  const nextId = index >= 0 && index < ids.length - 1 ? ids[index + 1] : null

  // Preload the neighbours so moving to them is instant
  useEffect(() => {
    for (const n of [nextId, prevId]) {
      if (n) queryClient.prefetchQuery(videoQuery(n))
    }
  }, [nextId, prevId, queryClient])

  // 1 = came from below (next), -1 = from above (previous); drives the slide-in
  const [direction, setDirection] = useState<1 | -1 | 0>(0)
  const go = useCallback(
    (step: 1 | -1) => {
      const target = step > 0 ? nextId : prevId
      if (!target) return
      setDirection(step)
      navigate(`/shortz/${target}`)
    },
    [nextId, prevId, navigate],
  )

  // Mouse wheel / trackpad: one short per gesture. Trackpads keep firing
  // (inertia) for a while, so stay locked until the events stop.
  const container = useRef<HTMLDivElement>(null)
  const goRef = useRef(go)
  goRef.current = go
  const hasData = Boolean(data)
  useEffect(() => {
    const el = container.current
    if (!el) return
    let acc = 0
    let lockedAt = 0
    let lastWheel = 0
    const onWheel = (e: WheelEvent) => {
      // Volume control handles its own wheel; comments scroll normally
      if (e.defaultPrevented) return
      if ((e.target as HTMLElement).closest('[data-no-swipe]')) return
      e.preventDefault()

      const now = performance.now()
      const sinceLast = now - lastWheel
      lastWheel = now
      if (lockedAt && (now - lockedAt < 500 || sinceLast < 150)) return
      lockedAt = 0
      if (sinceLast > 200) acc = 0

      acc += e.deltaY
      if (Math.abs(acc) > 40) {
        goRef.current(acc > 0 ? 1 : -1)
        acc = 0
        lockedAt = now
      }
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [hasData])

  // Touch: swipe up for next, down for previous
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0]
    touchStart.current = (e.target as HTMLElement).closest('[data-no-swipe]')
      ? null
      : { x: t.clientX, y: t.clientY }
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStart.current
    touchStart.current = null
    if (!start) return
    const t = e.changedTouches[0]
    const dx = t.clientX - start.x
    const dy = start.y - t.clientY
    if (Math.abs(dy) > 60 && Math.abs(dy) > Math.abs(dx)) go(dy > 0 ? 1 : -1)
  }

  // Keyboard: ↓ next, ↑ previous (←/→ seek inside the player)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement
      if (el.closest('input, textarea, [contenteditable="true"]')) return
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        go(1)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        go(-1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go])

  // A new short starts with comments closed; Esc closes them
  useEffect(() => setCommentsOpen(false), [id])
  useEffect(() => {
    if (!commentsOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setCommentsOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [commentsOpen])

  if (isPending) return <Spinner />
  if (isError) return <div className="p-4">Error: {error.message}</div>
  if (!data) {
    return <div className="p-8 text-center opacity-70">Short not found</div>
  }
  // While the next short loads, data is still the previous one
  const shownId = String(data.id)

  return (
    // Fills the layout's content box: between the header and the phone nav bar
    <div
      ref={container}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      className="relative flex h-full min-h-100 w-full overflow-hidden md:gap-4 md:py-2 md:pr-4"
    >
      <div
        key={shownId}
        className="min-w-0 flex-1"
        style={{
          animation: direction
            ? `${direction > 0 ? 'short-in-up' : 'short-in-down'} 280ms ease-out`
            : undefined,
        }}
      >
        <style>{`
          @keyframes short-in-up { from { transform: translateY(35%); opacity: 0 } }
          @keyframes short-in-down { from { transform: translateY(-35%); opacity: 0 } }
        `}</style>
        <Shortz
          autoPlay
          src={data.video_link}
          poster={data.thumbnail_link ?? ''}
          title={data.name}
          description={data.description}
          side={
            <div className="flex flex-col items-center gap-3 md:gap-4">
              <Link
                to={`/profile/${data.author_id}/videos/shorts`}
                title={data.username ? `@${data.username}` : 'Profile'}
                className="block h-12 w-12 overflow-hidden rounded-full border-2 border-white bg-white/20 shadow-md transition hover:scale-105"
              >
                {data.pfp ? (
                  <img
                    src={data.pfp}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center font-semibold uppercase">
                    {data.username?.[0] ?? '?'}
                  </span>
                )}
              </Link>
              <ReactionBar
                type="video"
                id={shownId}
                vertical
                onComments={() => setCommentsOpen((o) => !o)}
              />
            </div>
          }
        />
      </div>

      <CommentsPanel
        videoId={shownId}
        open={commentsOpen}
        onClose={() => setCommentsOpen(false)}
      />
    </div>
  )
}

/**
 * Phone: a bottom sheet sliding up over the video.
 * md+: a column beside the video (hidden while closed).
 */
function CommentsPanel({
  videoId,
  open,
  onClose,
}: {
  videoId: string | undefined
  open: boolean
  onClose: () => void
}) {
  const { data } = useComments(videoId as string, 'video')
  const count = Array.isArray(data) ? data.length : 0

  return (
    <>
      {/* Phone backdrop: tap above the sheet to close */}
      <div
        onClick={onClose}
        className={`absolute inset-0 z-20 bg-black/40 transition-opacity md:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <aside
        data-no-swipe
        aria-label="Comments"
        aria-hidden={!open}
        inert={!open}
        className={`absolute inset-x-0 bottom-0 z-30 flex h-[70%] flex-col rounded-t-2xl border-t border-white/10 bg-zinc-950 transition-transform duration-300 ease-out
          md:static md:z-auto md:h-auto md:w-96 md:shrink-0 md:rounded-xl md:border md:transition-none
          ${open ? 'translate-y-0' : 'translate-y-full md:hidden'}`}
      >
        <header className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3">
          <h2 className="font-semibold">
            Comments <span className="text-white/50">{count}</span>
          </h2>
          <button
            type="button"
            aria-label="Close comments"
            onClick={onClose}
            className="rounded-full p-1.5 text-white/60 hover:bg-white/10 hover:text-white"
          >
            <X size={20} />
          </button>
        </header>

        <CommentSection
          linkType="video"
          linkId={videoId}
          className="flex-1 px-4 pb-3"
          listClassName="flex-1 overflow-y-auto py-3 pr-1"
        />
      </aside>
    </>
  )
}
