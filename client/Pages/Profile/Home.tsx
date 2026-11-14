export function Home() {
  return (
    <div>
      <div className="flex justify-center bg-red-600 text-2xl">
        <h2>Construction ongoing</h2>
      </div>
      <ProfileGrid />
    </div>
  )
}

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

/* ------------------------------------------------------------------
   ITEM SHAPES (what your API should return)

   video:    { id, type: "video",    href, title, thumbnail, duration, views }
   song:     { id, type: "song",     href, title, artist, cover, audioUrl, duration }
   photo:    { id, type: "photo",    href, caption, images: [url, ...] }
   post:     { id, type: "post",     href, text, images: [url, ...], likes, comments }
   playlist: { id, type: "playlist", href, title, covers: [url, ...], tracks }

   - href is where the tile goes when clicked (e.g. "/video/12")
   - Any missing or broken image falls back to a gradient
------------------------------------------------------------------- */
const PLACEHOLDER_ITEMS = [
  {
    id: 1,
    type: 'song',
    href: '/songs/1',
    title: 'Midnight Drive',
    artist: 'GOD',
    cover: 'http://localhost:5173/images/janedoe2.jpg',
    audioUrl: '/audio/Deathwish.mp3',
    duration: '3:24',
  },
  {
    id: 2,
    type: 'post',
    href: '/posts/2',
    text: 'New banner is up. Spent all weekend on it, tell me what you think and what I should change before I make it permanent.',
    images: [
      'https://pbs.twimg.com/media/HVERTKrbIAAbjhL?format=jpg&name=small',
      'https://pbs.twimg.com/media/HVERTKrbIAAbjhL?format=jpg&name=small',
      'https://pbs.twimg.com/media/HVERTKrbIAAbjhL?format=jpg&name=small',
    ],
    likes: 24,
    comments: 6,
  },
  {
    id: 3,
    type: 'photo',
    href: '/photos/3',
    caption: 'Desk setup',
    images: ['/images/grace.jpg'],
  },
  {
    id: 4,
    type: 'video',
    href: '/videos/4',
    title: 'Evil man does thing',
    thumbnail: '/images/2c9c72a5-6894-46a3-bc26-5a978e1e5e3c.png',
    duration: '12:41',
    views: 1280,
  },
  {
    id: 5,
    type: 'video',
    href: '/videos/5',
    title: 'Ranked highlights',
    thumbnail:
      'https://pbs.twimg.com/media/HVERTKrbIAAbjhL?format=jpg&name=small',
    duration: '4:02',
    views: 640,
  },
  {
    id: 6,
    type: 'post',
    href: '/posts/6',
    text: 'UH that litty fresh yo.',
    images: [],
    likes: 12,
    comments: 1,
  },
  {
    id: 7,
    type: 'playlist',
    href: '/playlists/7',
    title: 'Late night focus',
    tracks: 18,
    covers: [
      'https://picsum.photos/seed/pl7a/400/400',
      'https://picsum.photos/seed/pl7b/400/400',
      'https://picsum.photos/seed/pl7c/400/400',
    ],
  },
  {
    id: 8,
    type: 'photo',
    href: '/photos/8',
    caption: 'Weekend trip',
    images: [
      '/images/f149d10f-dace-4439-b1ef-cd8d7a5213df.jfif',
      '/images/45f1d8f4-a5a5-49a5-979d-98b7a730cb65.jpg',
      '/images/f149d10f-dace-4439-b1ef-cd8d7a5213df.jfif',
      '/images/45f1d8f4-a5a5-49a5-979d-98b7a730cb65.jpg',
    ],
  },
  {
    id: 9,
    type: 'song',
    href: '/songs/9',
    title: 'Neon Rain',
    artist: 'GOD',
    cover: 'https://picsum.photos/seed/song9/400/400',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    duration: '2:58',
  },
  {
    id: 10,
    type: 'video',
    href: '/videos/10',
    title: 'Clip dump',
    thumbnail: 'https://picsum.photos/seed/video10/960/540',
    duration: '0:48',
    views: 95,
  },
]

/* ------------------------------------------------------------------
   LINKS
   Tiles render a plain <a href> by default. If you use React Router,
   pass a custom link component:

   <ProfileGrid
     items={items}
     linkComponent={({ href, ...p }) => <Link to={href} {...p} />}
   />
------------------------------------------------------------------- */
const DefaultLink = ({ href, ...props }) => <a href={href} {...props} />
const LinkContext = createContext(DefaultLink)

/* ------------------------------------------------------------------
   SIZES
   Full class strings so Tailwind can see them.
   Mobile grid is 2 columns, desktop is 4 columns.
------------------------------------------------------------------- */
const SIZE_CLASS = {
  '1x1': 'col-span-1 row-span-1',
  '2x1': 'col-span-2 row-span-1',
  '1x2': 'col-span-1 row-span-2',
  '2x2': 'col-span-2 row-span-2',
  '3x2': 'col-span-2 row-span-2 md:col-span-3',
}

// Which sizes each item can take, based on what it contains.
// Every list has at least 2 options so the layout can always alternate.
function sizesFor(item) {
  const imageCount = item.images?.length ?? 0
  switch (item.type) {
    case 'video':
      return ['2x2', '2x1']
    case 'song':
      return ['1x1', '2x1']
    case 'playlist':
      return ['1x2', '2x1']
    case 'photo':
      return imageCount > 1 ? ['2x2', '1x2', '1x1'] : ['1x2', '1x1']
    case 'post':
      if (imageCount > 0) return ['3x2', '2x2']
      return item.text?.length > 100 ? ['2x2', '2x1'] : ['2x1', '1x1']
    default:
      return ['1x1', '2x1']
  }
}

// Cycle through each type's sizes and never repeat the previous tile's size.
function assignSizes(items) {
  const counters = {}
  let prev = null
  return items.map((item) => {
    const options = sizesFor(item)
    const n = counters[item.type] ?? 0
    let size = options[n % options.length]
    if (size === prev) size = options[(n + 1) % options.length]
    counters[item.type] = n + 1
    prev = size
    return { ...item, size }
  })
}

/* ------------------------------------------------------------------ */
/* Shared pieces                                                       */
/* ------------------------------------------------------------------ */
const hueFor = (item) =>
  item.hue ??
  [...String(item.id)].reduce((a, c) => a + c.charCodeAt(0) * 47, 0) % 360

const gradient = (hue) =>
  `linear-gradient(135deg, hsl(${hue} 60% 38%), hsl(${(hue + 60) % 360} 60% 18%))`

// Image that fills its box. Falls back to a gradient if there's no src or it fails to load.
// Pass sizing/position classes (e.g. "absolute inset-0", "aspect-square") via className.
function Pic({ src, alt = '', hue = 200, className = '' }) {
  const [failed, setFailed] = useState(false)
  const positioned = className.includes('absolute') ? '' : 'relative'
  return (
    <div className={`${positioned} overflow-hidden ${className}`}>
      {src && !failed ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 "
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{ background: gradient(hue) }}
        />
      )}
    </div>
  )
}

const PlayIcon = ({ className = 'h-5 w-5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M8 5v14l11-7z" />
  </svg>
)

const PauseIcon = ({ className = 'h-5 w-5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
  </svg>
)

// The whole tile is clickable via an invisible stretched link.
// Anything that needs its own click (like a play button) sits above it with z-20.
function Tile({ item, label, children }) {
  const Link = useContext(LinkContext)
  return (
    <article
      className={`group ${SIZE_CLASS[item.size]} relative overflow-hidden rounded-2xl border border-white/10 bg-black/50 text-white backdrop-blur-md`}
    >
      {children}
      {item.href && (
        <Link
          href={item.href}
          aria-label={label}
          className="absolute inset-0 z-10 rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white"
        />
      )}
    </article>
  )
}

// Dark fade so text stays readable over any image
const Scrim = ({ children }) => (
  <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
    {children}
  </div>
)

const isWide = (size) => size === '2x1' || size === '3x2'

/* ------------------------------------------------------------------ */
/* Tiles                                                               */
/* ------------------------------------------------------------------ */
function VideoTile({ item }) {
  return (
    <Tile item={item} label={`Watch ${item.title}`}>
      <Pic
        src={item.thumbnail}
        alt=""
        hue={hueFor(item)}
        className="absolute inset-0"
      />

      {/* Text box, bottom left */}
      <div className="pointer-events-none absolute bottom-2 left-2 max-w-[70%] rounded-lg bg-black/60 px-2.5 py-1.5">
        <h3 className="truncate text-sm font-medium">{item.title}</h3>
        {item.views != null && (
          <p className="text-xs text-white/70">
            {item.views.toLocaleString()} views
          </p>
        )}
      </div>

      {item.duration && (
        <span className="pointer-events-none absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-xs">
          {item.duration}
        </span>
      )}
    </Tile>
  )
}

// Only one song plays at a time across the whole grid
let currentAudio = null

function SongTile({ item }) {
  const wide = isWide(item.size)
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => () => audioRef.current?.pause(), [])

  const toggle = () => {
    if (!item.audioUrl) return
    if (!audioRef.current) {
      const a = new Audio(item.audioUrl)
      a.addEventListener('play', () => setPlaying(true))
      a.addEventListener('pause', () => setPlaying(false))
      a.addEventListener('ended', () => setProgress(0))
      a.addEventListener('timeupdate', () =>
        setProgress(a.duration ? a.currentTime / a.duration : 0),
      )
      audioRef.current = a
    }
    const a = audioRef.current
    if (a.paused) {
      if (currentAudio && currentAudio !== a) currentAudio.pause()
      currentAudio = a
      a.play().catch(() => setPlaying(false))
    } else {
      a.pause()
    }
  }

  const button = item.audioUrl && (
    <button
      type="button"
      onClick={toggle}
      aria-label={`${playing ? 'Pause' : 'Play'} ${item.title}`}
      className={`relative z-20 grid shrink-0 place-items-center rounded-full bg-white text-black hover:bg-white/80 ${
        wide ? 'h-12 w-12' : 'absolute right-3 top-3 h-9 w-9'
      }`}
    >
      {playing ? <PauseIcon /> : <PlayIcon className="ml-0.5 h-5 w-5" />}
    </button>
  )

  return (
    <Tile item={item} label={`Open ${item.title}`}>
      <Pic
        src={item.cover}
        alt=""
        hue={hueFor(item)}
        className="absolute inset-0"
      />
      <div
        className={`pointer-events-none absolute inset-0 flex bg-black/40 ${
          wide ? 'items-center gap-4 p-4' : 'flex-col justify-end p-3'
        }`}
      >
        <div className="pointer-events-auto contents">{button}</div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-medium">{item.title}</h3>
          <p className="truncate text-xs text-white/70">{item.artist}</p>
          {wide && (
            <div className="mt-2">
              <div className="h-1 rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-white"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
              {item.duration && (
                <p className="mt-1 text-right text-xs text-white/70">
                  {item.duration}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </Tile>
  )
}

function PhotoTile({ item }) {
  const images = item.images ?? []
  const mosaic = images.length > 1 && item.size === '2x2'
  return (
    <Tile item={item} label={`Open ${item.caption || 'photo'}`}>
      {mosaic ? (
        <div className="absolute inset-0 grid auto-rows-fr grid-cols-2 gap-0.5">
          {images.slice(0, 4).map((src, i) => (
            <Pic key={src} src={src} hue={(hueFor(item) + i * 35) % 360} />
          ))}
        </div>
      ) : (
        <Pic
          src={images[0]}
          alt={item.caption}
          hue={hueFor(item)}
          className="absolute inset-0"
        />
      )}
      {(item.caption || images.length > 1) && (
        <Scrim>
          {item.caption && <p className="truncate text-sm">{item.caption}</p>}
          {images.length > 1 && (
            <p className="text-xs text-white/70">{images.length} photos</p>
          )}
        </Scrim>
      )}
    </Tile>
  )
}

function PostTile({ item }) {
  const images = (item.images ?? []).slice(0, 4)
  const hasImages = images.length > 0
  const wide = item.size === '3x2'
  const small = item.size === '1x1'

  return (
    <Tile item={item} label="Open post">
      <div className={`flex h-full ${wide ? 'flex-row' : 'flex-col'}`}>
        <div
          className={`flex min-w-0 flex-col p-4 ${wide ? 'w-2/5' : hasImages ? '' : 'flex-1'}`}
        >
          <p
            className={
              small
                ? 'line-clamp-4 text-sm'
                : hasImages
                  ? 'line-clamp-3 text-sm'
                  : 'line-clamp-6 text-base'
            }
          >
            {item.text}
          </p>
          {!small && item.likes != null && (
            <p className="mt-auto pt-2 text-xs text-white/60">
              {item.likes} likes &middot; {item.comments ?? 0} comments
            </p>
          )}
        </div>
        {hasImages && (
          <div
            className={`grid min-h-0 flex-1 auto-rows-fr gap-0.5 ${
              images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
            }`}
          >
            {images.map((src, i) => (
              <Pic
                key={src}
                src={src}
                hue={(hueFor(item) + i * 40) % 360}
                className={images.length === 3 && i === 0 ? 'row-span-2' : ''}
              />
            ))}
          </div>
        )}
      </div>
    </Tile>
  )
}

function PlaylistTile({ item }) {
  const wide = isWide(item.size)
  const covers = item.covers ?? []
  const hue = hueFor(item)
  return (
    <Tile item={item} label={`Open playlist ${item.title}`}>
      <div
        className={`flex h-full ${wide ? 'flex-row items-center gap-4 p-4' : 'flex-col'}`}
      >
        <div
          className={`relative ${wide ? 'aspect-square h-full shrink-0' : 'flex-1'}`}
        >
          <Pic
            src={covers[2]}
            hue={(hue + 80) % 360}
            className="absolute inset-x-4 top-2 bottom-0 rounded-xl opacity-50"
          />
          <Pic
            src={covers[1]}
            hue={(hue + 40) % 360}
            className="absolute inset-x-2 top-1 bottom-0 rounded-xl opacity-75"
          />
          <Pic
            src={covers[0]}
            hue={hue}
            className={`absolute inset-0 ${wide ? 'rounded-xl' : ''}`}
          />
          <span className="pointer-events-none absolute inset-0 grid place-items-center">
            <PlayIcon className="h-7 w-7" />
          </span>
        </div>
        <div className={wide ? 'min-w-0' : 'p-3'}>
          <h3 className="truncate text-sm font-medium">{item.title}</h3>
          <p className="text-xs text-white/70">{item.tracks} tracks</p>
        </div>
      </div>
    </Tile>
  )
}

const TILES = {
  video: VideoTile,
  song: SongTile,
  photo: PhotoTile,
  post: PostTile,
  playlist: PlaylistTile,
}

/* ------------------------------------------------------------------ */
/* Grid                                                                */
/* ------------------------------------------------------------------ */
export default function ProfileGrid({
  items = PLACEHOLDER_ITEMS,
  linkComponent = DefaultLink,
}) {
  const laidOut = useMemo(() => assignSizes(items), [items])

  if (laidOut.length === 0) {
    return (
      <p className="p-6 text-center text-sm text-white/70">Nothing here yet.</p>
    )
  }

  return (
    <LinkContext.Provider value={linkComponent}>
      {/* grid-flow-dense backfills gaps left by bigger tiles */}
      <section className="grid auto-rows-[150px] grid-flow-dense grid-cols-2 gap-3 p-4 md:auto-rows-[170px] md:grid-cols-4">
        {laidOut.map((item) => {
          const Component = TILES[item.type]
          return Component ? <Component key={item.id} item={item} /> : null
        })}
      </section>
    </LinkContext.Provider>
  )
}
