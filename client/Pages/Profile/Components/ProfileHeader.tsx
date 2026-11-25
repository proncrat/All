import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { NavLink, useLocation, useParams } from 'react-router'

interface Tab {
  text: string
  link: string
  /** Force the tab active (e.g. "Music" while on any of its sub-tabs). */
  active?: boolean
}

/** Profile sub-routes that live under the "Music" tab. */
const MUSIC_TABS: Tab[] = [
  { text: 'Songs', link: 'song' },
  { text: 'Albums', link: 'albums' },
]

/** Sub-tabs under "Videos": regular videos and vertical Shorts. */
const VIDEO_TABS: Tab[] = [
  { text: 'Videos', link: 'videos' },
  { text: 'Shorts', link: 'videos/shorts' },
]

/** Sub-tabs under "Reposts" — one per repostable content type. */
const REPOST_TABS: Tab[] = [
  { text: 'All', link: 'reposts' },
  { text: 'Videos', link: 'reposts/videos' },
  { text: 'Posts', link: 'reposts/posts' },
  { text: 'Songs', link: 'reposts/songs' },
  { text: 'Photos', link: 'reposts/photos' },
]

/** A scrollable row of links with an underline that slides to the active one. */
function TabBar({ tabs, className = '' }: { tabs: Tab[]; className?: string }) {
  const { pathname } = useLocation()
  const containerRef = useRef<HTMLDivElement>(null)
  const [pill, setPill] = useState<{ left: number; width: number } | null>(null)
  const [animate, setAnimate] = useState(false)

  const measure = useCallback(() => {
    const active = containerRef.current?.querySelector<HTMLElement>('a.active')
    if (!active) {
      setPill(null)
      return
    }
    setPill({ left: active.offsetLeft, width: active.offsetWidth })
  }, [])

  useLayoutEffect(() => {
    measure()
    containerRef.current
      ?.querySelector<HTMLElement>('a.active')
      ?.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      })
  }, [pathname, measure])

  useEffect(() => {
    const ro = new ResizeObserver(measure)
    if (containerRef.current) ro.observe(containerRef.current)
    const raf = requestAnimationFrame(() => setAnimate(true))
    return () => {
      ro.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [measure])

  return (
    <div
      ref={containerRef}
      className={`relative flex gap-3 overflow-x-auto whitespace-nowrap [&>*]:shrink-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden snap-x border-b border-b-zinc-400 px-4 pt-2 ${className}`}
    >
      {tabs.map((tab) => (
        <NavLink
          key={tab.link}
          end
          to={tab.link}
          className={({ isActive }) =>
            `text-lg pb-2 ${isActive || tab.active ? 'active' : ''}`
          }
        >
          {tab.text}
        </NavLink>
      ))}

      <span
        aria-hidden
        className={`absolute bottom-0 left-0 h-0.5 rounded-full bg-current pointer-events-none ${
          animate ? 'transition-[transform,width] duration-400 ease-out' : ''
        }`}
        style={{
          width: pill?.width ?? 0,
          transform: `translateX(${pill?.left ?? 0}px)`,
          opacity: pill ? 1 : 0,
        }}
      />
    </div>
  )
}

function ProfileHeader() {
  const { id } = useParams()
  const { pathname } = useLocation()

  // Routes match case-insensitively (e.g. /Song), so compare lowercased
  const segments = pathname.toLowerCase().split('/').filter(Boolean)
  const section = segments.at(-1)
  const inReposts = segments[2] === 'reposts' // /profile/:id/reposts/...
  const inVideos = segments[2] === 'videos' // /profile/:id/videos/...
  const inMusic = !inReposts && MUSIC_TABS.some((t) => t.link === section)

  const tabs: Tab[] = [
    { text: 'Home', link: '/profile/' + id },
    { text: 'Videos', link: 'videos', active: inVideos },
    { text: 'Posts', link: 'posts' },
    { text: 'Music', link: 'song', active: inMusic },
    { text: 'Playlists', link: 'playlist' },
    { text: 'Photos', link: 'picture' },
    { text: 'Reposts', link: 'reposts', active: inReposts },
    { text: 'About', link: 'about' },
  ]

  return (
    <div className="sticky top-[48px] z-60 pb-2backdrop-blur-md bg-sidebar transition-[top] duration-300 max-md:[html[data-header-hidden=true]_&]:top-0">
      <TabBar tabs={tabs} className="border-t border-t-zinc-800" />
      {inVideos && <TabBar tabs={VIDEO_TABS} />}
      {inMusic && <TabBar tabs={MUSIC_TABS} />}
      {inReposts && <TabBar tabs={REPOST_TABS} />}
    </div>
  )
}

export default ProfileHeader
