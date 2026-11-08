import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { NavLink, useLocation, useParams } from 'react-router'
interface Sublink {
  link: string
  text: string
}
function SubHeaderLink(props: Sublink) {
  return (
    <NavLink end to={props.link} className="text-lg pb-2">
      {props.text}
    </NavLink>
  )
}

function ProfileHeader() {
  const { id } = useParams()
  const { pathname } = useLocation()

  const containerRef = useRef<HTMLDivElement>(null)
  const [pill, setPill] = useState<{ left: number; width: number } | null>(null)
  const [animate, setAnimate] = useState(false)

  const options = [
    'Home',
    'Videos',
    'Posts',
    'Songs',
    'Playlists',
    'Photos',
    'About',
  ]
  const links = [
    '/profile/' + id,
    'videos',
    'posts',
    'song',
    'playlist',
    'picture',
    'about',
  ]

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
    <div className="sticky top-[48px] z-20 backdrop-blur-md bg-sidebar">
      <div
        ref={containerRef}
        className="relative flex gap-3 mb-2 overflow-x-auto whitespace-nowrap [&>*]:shrink-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden snap-x border-t border-b border-b-zinc-400 border-t-zinc-800 px-4 pt-2"
      >
        {options.map((text, index) => (
          <SubHeaderLink key={index} link={links[index]} text={text} />
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
    </div>
  )
}

export default ProfileHeader
