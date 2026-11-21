import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router'
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  FileText,
  Image as ImageIcon,
  Music,
  Pause,
  Play,
  Repeat2,
  ThumbsDown,
  ThumbsUp,
  Video,
  type LucideIcon,
} from 'lucide-react'
import { useSession } from '@/lib/auth'
import { useLibrary } from '@/client/hooks/usereactions'
import { usePlayer } from '../Main/PlayerContext'
import { hrefFor, toSong } from './items'
import { PlaylistsTab } from './PlaylistsTab'
import { Spinner } from '../Util/SpinnerBox'
import type { LibraryItem, ReactionTarget } from '@/client/apis/reactionsapi'

const TYPES: { type: ReactionTarget; label: string; Icon: LucideIcon }[] = [
  { type: 'video', label: 'Videos', Icon: Video },
  { type: 'song', label: 'Songs', Icon: Music },
  { type: 'post', label: 'Posts', Icon: FileText },
  { type: 'photo', label: 'Photos', Icon: ImageIcon },
]
const TYPE_ICON = Object.fromEntries(TYPES.map((t) => [t.type, t.Icon]))

/* ------------------------------------------------------------------ */
/* Card                                                                */
/* ------------------------------------------------------------------ */

function Card({ item, queue }: { item: LibraryItem; queue: LibraryItem[] }) {
  const { current, playing, playSong, toggle } = usePlayer()
  const href = hrefFor(item)
  const Icon = TYPE_ICON[item.type]
  const title = item.title || 'Untitled'

  const isThisSong =
    item.type === 'song' &&
    current?.id === item.id &&
    current.src === item.media
  const playThis = () => {
    if (isThisSong) return toggle()
    const songs = queue.filter((q) => q.type === 'song' && q.media)
    playSong(toSong(item), songs.map(toSong))
  }

  const media = (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-neutral-900">
      {item.image ? (
        <img
          src={item.image}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : item.type === 'post' ? (
        <p className="line-clamp-4 h-full p-3 text-xs leading-relaxed text-white/70">
          {item.text || title}
        </p>
      ) : (
        <div className="grid h-full place-items-center text-white/20">
          <Icon size={32} strokeWidth={1.5} />
        </div>
      )}

      <span className="pointer-events-none absolute left-2 top-2 flex items-center gap-1 rounded-md bg-black/70 px-1.5 py-0.5 text-[11px] capitalize text-white/80">
        <Icon size={12} />
        {item.type}
      </span>

      {item.runtime && (
        <span className="pointer-events-none absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-[11px]">
          {item.runtime}
        </span>
      )}
    </div>
  )

  return (
    <article className="group w-48 shrink-0 snap-start sm:w-56">
      {item.type === 'song' ? (
        <div className="relative">
          {media}
          <button
            type="button"
            onClick={playThis}
            disabled={!item.media}
            aria-label={`${isThisSong && playing ? 'Pause' : 'Play'} ${title}`}
            className="absolute inset-0 grid cursor-pointer place-items-center rounded-xl bg-black/0 transition-colors hover:bg-black/40 disabled:cursor-not-allowed"
          >
            <span
              className={`grid h-11 w-11 place-items-center rounded-full bg-white text-black transition-opacity ${
                isThisSong ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}
            >
              {isThisSong && playing ? (
                <Pause size={18} className="fill-current" />
              ) : (
                <Play size={18} className="ml-0.5 fill-current" />
              )}
            </span>
          </button>
        </div>
      ) : href ? (
        <Link to={href} aria-label={title} className="block">
          {media}
        </Link>
      ) : (
        media
      )}

      <div className="mt-2 min-w-0 px-0.5">
        {href ? (
          <Link
            to={href}
            className="line-clamp-1 text-sm font-medium hover:underline"
          >
            {title}
          </Link>
        ) : (
          <p className="line-clamp-1 text-sm font-medium">{title}</p>
        )}
        {item.author && (
          <p className="truncate text-xs text-white/50">{item.author}</p>
        )}
      </div>
    </article>
  )
}

/* ------------------------------------------------------------------ */
/* Horizontal bar                                                      */
/* ------------------------------------------------------------------ */

function Shelf({
  title,
  Icon,
  items,
  empty,
}: {
  title: string
  Icon: LucideIcon
  items: LibraryItem[]
  empty: ReactNode
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(false)

  const update = () => {
    const el = trackRef.current
    if (!el) return
    setCanLeft(el.scrollLeft > 4)
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }

  useEffect(() => {
    update()
    const el = trackRef.current
    if (!el) return
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [items.length])

  const scroll = (dir: 1 | -1) => {
    const el = trackRef.current
    if (el)
      el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' })
  }

  const arrow =
    'grid h-8 w-8 cursor-pointer place-items-center rounded-full border border-white/20 ' +
    'transition-colors hover:border-white disabled:cursor-default disabled:opacity-30 disabled:hover:border-white/20'

  return (
    <section className="space-y-3">
      <header className="flex items-center gap-2 px-4 sm:px-6">
        <Icon size={18} className="text-white/60" />
        <h2 className="text-lg font-semibold">{title}</h2>
        <span className="text-sm text-white/40">{items.length}</span>
        {items.length > 0 && (
          <div className="ml-auto hidden gap-2 md:flex">
            <button
              type="button"
              aria-label={`Scroll ${title} left`}
              disabled={!canLeft}
              onClick={() => scroll(-1)}
              className={arrow}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              aria-label={`Scroll ${title} right`}
              disabled={!canRight}
              onClick={() => scroll(1)}
              className={arrow}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </header>

      {items.length ? (
        <div
          ref={trackRef}
          onScroll={update}
          className="flex snap-x snap-proximity gap-4 overflow-x-auto overscroll-x-contain scroll-px-4 px-4 pb-2
            [scrollbar-width:none] sm:scroll-px-6 sm:px-6 [&::-webkit-scrollbar]:hidden"
        >
          {items.map((item) => (
            <Card key={`${item.type}-${item.id}`} item={item} queue={items} />
          ))}
        </div>
      ) : (
        <div className="mx-4 rounded-xl border border-dashed border-white/15 px-4 py-8 text-center text-sm text-white/40 sm:mx-6">
          {empty}
        </div>
      )}
    </section>
  )
}

/** One bar per content type that has items; a single empty bar if none do. */
function TypedShelves({
  verb,
  Icon,
  items,
  empty,
}: {
  verb: string
  Icon: LucideIcon
  items: LibraryItem[]
  empty: string
}) {
  const groups = TYPES.map((t) => ({
    ...t,
    items: items.filter((i) => i.type === t.type),
  })).filter((g) => g.items.length)

  if (!groups.length) {
    return <Shelf title={verb} Icon={Icon} items={[]} empty={empty} />
  }
  return (
    <>
      {groups.map((g) => (
        <Shelf
          key={g.type}
          title={`${verb} ${g.label.toLowerCase()}`}
          Icon={Icon}
          items={g.items}
          empty={empty}
        />
      ))}
    </>
  )
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'playlists', label: 'Playlists' },
] as const
type Tab = (typeof TABS)[number]['id']

export function LibraryPage() {
  const { data: session, isPending: sessionPending } = useSession()
  const [params, setParams] = useSearchParams()
  const tab: Tab = params.get('tab') === 'playlists' ? 'playlists' : 'overview'
  const { data, isPending, isError } = useLibrary(
    Boolean(session) && tab === 'overview',
  )

  if (sessionPending) return <Spinner />

  if (!session) {
    return (
      <p className="py-24 text-center text-sm text-white/60">
        <Link to="/signin" className="underline hover:text-white">
          Sign in
        </Link>{' '}
        to see your library.
      </p>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-10 py-6 sm:py-8">
      <header className="px-4 sm:px-6">
        <h1 className="text-2xl font-semibold">Library</h1>
        <p className="mt-1 text-sm text-white/50">
          {tab === 'playlists'
            ? 'Playlists you’ve made.'
            : 'Everything you’ve liked, disliked, saved and reposted.'}
        </p>
        <nav
          role="tablist"
          aria-label="Library sections"
          className="mt-5 flex gap-6 border-b border-white/10"
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() =>
                setParams(t.id === 'overview' ? {} : { tab: t.id }, {
                  replace: true,
                })
              }
              className={`-mb-px cursor-pointer border-b-2 pb-2 text-sm font-medium transition-colors ${
                tab === t.id
                  ? 'border-white text-white'
                  : 'border-transparent text-white/50 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      {tab === 'playlists' ? (
        <PlaylistsTab />
      ) : isPending ? (
        <Spinner />
      ) : isError || !data ? (
        <p className="px-4 text-sm text-red-400 sm:px-6">
          Couldn&apos;t load your library. Please try again.
        </p>
      ) : (
        <>
          <Shelf
            title="Liked"
            Icon={ThumbsUp}
            items={data.like}
            empty="Things you like will show up here."
          />
          <Shelf
            title="Disliked"
            Icon={ThumbsDown}
            items={data.dislike}
            empty="Things you dislike will show up here."
          />
          <TypedShelves
            verb="Saved"
            Icon={Bookmark}
            items={data.save}
            empty="Tap the bookmark on anything to save it for later."
          />
          <TypedShelves
            verb="Reposted"
            Icon={Repeat2}
            items={data.repost}
            empty="Things you repost will show up here."
          />
        </>
      )}
    </div>
  )
}
