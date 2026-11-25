import { Link, useParams } from 'react-router'
import { useState, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import request from 'superagent'
import { usePlayer, type Song } from '../Main/PlayerContext'

/* ------------------------------------------------------------------
   ITEM SHAPES (returned by GET /api/v1/profile/:id/home)
------------------------------------------------------------------- */
type VideoItem = {
  type: 'video'
  id: number
  href: string
  title: string
  thumbnail: string | null
  views: number | null
}
type PostItem = {
  type: 'post'
  id: number
  href: string
  title: string | null
  text: string
  images: string[]
  likes: number | null
}
type PhotoItem = {
  type: 'photo'
  id: number
  href: string
  caption: string | null
  images: string[]
}
type SongItem = {
  type: 'song'
  id: number
  href: string
  title: string
  artist: string | null
  cover: string | null
  audioUrl: string
  duration: string | null
}
type PlaylistItem = {
  type: 'playlist'
  id: number
  href: string
  title: string
  covers: string[]
  tracks: number
}
type HomeItem = VideoItem | PostItem | PhotoItem | SongItem | PlaylistItem
type Size = '1x1' | '2x1' | '1x2' | '2x2' | '3x2'
type Sized<T extends HomeItem = HomeItem> = T & { size: Size }

function useProfileHome(id: string | undefined) {
  return useQuery({
    queryKey: ['profileAll', id, 'home'],
    queryFn: async (): Promise<HomeItem[]> =>
      (await request.get(`/api/v1/profile/${id}/home`)).body,
    enabled: !!id,
  })
}

export function Home() {
  const { id } = useParams()
  const { data, isPending, isError } = useProfileHome(id)

  if (isPending) return <GridSkeleton />
  if (isError) {
    return (
      <p className="p-8 text-center text-sm opacity-70">
        Couldn&apos;t load this profile&apos;s content.
      </p>
    )
  }
  return <ProfileGrid items={data} />
}

/* ------------------------------------------------------------------
   SIZES
   Full class strings so Tailwind can see them.
   Mobile grid is 2 columns, desktop is 4 columns.
------------------------------------------------------------------- */
const SIZE_CLASS: Record<Size, string> = {
  '1x1': 'col-span-1 row-span-1',
  '2x1': 'col-span-2 row-span-1',
  '1x2': 'col-span-1 row-span-2',
  '2x2': 'col-span-2 row-span-2',
  '3x2': 'col-span-2 row-span-2 md:col-span-3',
}

// Which sizes each item can take, based on what it contains.
function sizesFor(item: HomeItem): Size[] {
  switch (item.type) {
    case 'video':
      return ['2x2', '2x1']
    case 'song':
      return ['1x1', '2x1']
    case 'playlist':
      return ['1x2', '2x1']
    case 'photo':
      return ['1x2', '1x1']
    case 'post':
      if (item.images.length > 0) return ['3x2', '2x2']
      return item.text.length > 100 ? ['2x2', '2x1'] : ['2x1', '1x1']
  }
}

// Cycle through each type's sizes and never repeat the previous tile's size.
function assignSizes(items: HomeItem[]): Sized[] {
  const counters: Record<string, number> = {}
  let prev: Size | null = null
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
const hueFor = (item: HomeItem) =>
  (((item.id * 47 + item.type.length * 97) % 360) + 360) % 360

const gradient = (hue: number) =>
  `linear-gradient(135deg, hsl(${hue} 60% 38%), hsl(${(hue + 60) % 360} 60% 18%))`

// Image that fills its box. Falls back to a gradient if there's no src or it fails to load.
function Pic({
  src,
  alt = '',
  hue = 200,
  className = '',
}: {
  src?: string | null
  alt?: string
  hue?: number
  className?: string
}) {
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
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
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
function Tile({
  item,
  label,
  children,
}: {
  item: Sized
  label: string
  children: ReactNode
}) {
  return (
    <article
      className={`group ${SIZE_CLASS[item.size]} relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 text-white`}
    >
      {children}
      <Link
        to={item.href}
        aria-label={label}
        className="absolute inset-0 z-10 rounded-2xl focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white"
      />
    </article>
  )
}

// Dark fade so text stays readable over any image
const Scrim = ({ children }: { children: ReactNode }) => (
  <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 to-transparent p-3 pt-8">
    {children}
  </div>
)

const isWide = (size: Size) => size === '2x1' || size === '3x2'

/* ------------------------------------------------------------------ */
/* Tiles                                                               */
/* ------------------------------------------------------------------ */
function VideoTile({ item }: { item: Sized<VideoItem> }) {
  return (
    <Tile item={item} label={`Watch ${item.title}`}>
      <Pic
        src={item.thumbnail}
        hue={hueFor(item)}
        className="absolute inset-0"
      />
      <span className="pointer-events-none absolute left-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-black/60">
        <PlayIcon className="ml-0.5 h-4 w-4" />
      </span>
      <Scrim>
        <h3 className="truncate text-sm font-medium">{item.title}</h3>
        {item.views != null && (
          <p className="text-xs text-white/70">
            {item.views.toLocaleString()} views
          </p>
        )}
      </Scrim>
    </Tile>
  )
}

function SongTile({ item, queue }: { item: Sized<SongItem>; queue: Song[] }) {
  const wide = isWide(item.size)
  const { current, playing, playSong, toggle } = usePlayer()
  const isCurrent = current?.src === item.audioUrl
  const isPlaying = isCurrent && playing

  const onPlay = () => {
    if (isCurrent) toggle()
    else
      playSong(
        queue.find((s) => s.id === item.id)!,
        queue,
      )
  }

  return (
    <Tile item={item} label={`Open ${item.title}`}>
      <Pic src={item.cover} hue={hueFor(item)} className="absolute inset-0" />
      <div
        className={`pointer-events-none absolute inset-0 flex bg-black/40 ${
          wide ? 'items-center gap-4 p-4' : 'flex-col justify-end p-3'
        }`}
      >
        <button
          type="button"
          onClick={onPlay}
          aria-label={`${isPlaying ? 'Pause' : 'Play'} ${item.title}`}
          className={`pointer-events-auto z-20 grid shrink-0 place-items-center rounded-full bg-white text-black shadow transition hover:scale-105 ${
            wide ? 'relative h-12 w-12' : 'absolute right-3 top-3 h-9 w-9'
          }`}
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon className="ml-0.5 h-5 w-5" />}
        </button>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-medium">{item.title}</h3>
          {item.artist && (
            <p className="truncate text-xs text-white/70">{item.artist}</p>
          )}
          {wide && item.duration && (
            <p className="mt-1 text-xs text-white/60">{item.duration}</p>
          )}
        </div>
      </div>
    </Tile>
  )
}

function PhotoTile({ item }: { item: Sized<PhotoItem> }) {
  return (
    <Tile item={item} label={`Open ${item.caption || 'photo'}`}>
      <Pic
        src={item.images[0]}
        alt={item.caption ?? ''}
        hue={hueFor(item)}
        className="absolute inset-0"
      />
      {item.caption && (
        <Scrim>
          <p className="truncate text-sm">{item.caption}</p>
        </Scrim>
      )}
    </Tile>
  )
}

function PostTile({ item }: { item: Sized<PostItem> }) {
  const images = item.images.slice(0, 4)
  const hasImages = images.length > 0
  const wide = item.size === '3x2'
  const small = item.size === '1x1'
  const text = (item.text || item.title || '').replace(
    /\s*<br\s*\/?>\s*/gi,
    '\n',
  )

  return (
    <Tile item={item} label="Open post">
      <div
        className={`flex h-full ${wide ? 'flex-col md:flex-row' : 'flex-col'}`}
      >
        <div
          className={`flex min-w-0 flex-col p-4 ${
            wide ? 'md:w-2/5' : hasImages ? '' : 'flex-1'
          }`}
        >
          {item.title && item.text && !small && (
            <h3 className="mb-1 truncate text-sm font-semibold">
              {item.title}
            </h3>
          )}
          <p
            className={`wrap-break-word whitespace-pre-line ${
              small
                ? 'line-clamp-4 text-sm'
                : hasImages
                  ? 'line-clamp-3 text-sm'
                  : 'line-clamp-5 text-base'
            }`}
          >
            {text}
          </p>
          {!small && item.likes != null && (
            <p className="mt-auto pt-2 text-xs text-white/60">
              {item.likes} likes
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
                key={i}
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

function PlaylistTile({ item }: { item: Sized<PlaylistItem> }) {
  const wide = isWide(item.size)
  const hue = hueFor(item)
  return (
    <Tile item={item} label={`Open playlist ${item.title}`}>
      <div
        className={`flex h-full ${wide ? 'flex-row items-center gap-4 p-4' : 'flex-col'}`}
      >
        <div
          className={`relative ${wide ? 'aspect-square h-full shrink-0' : 'm-3 mb-0 flex-1'}`}
        >
          <Pic
            src={item.covers[2]}
            hue={(hue + 80) % 360}
            className="absolute inset-x-4 -top-2 bottom-2 rounded-xl opacity-40"
          />
          <Pic
            src={item.covers[1]}
            hue={(hue + 40) % 360}
            className="absolute inset-x-2 -top-1 bottom-1 rounded-xl opacity-70"
          />
          <Pic
            src={item.covers[0]}
            hue={hue}
            className="absolute inset-0 top-1 rounded-xl"
          />
        </div>
        <div className={wide ? 'min-w-0' : 'p-3'}>
          <h3 className="truncate text-sm font-medium">{item.title}</h3>
          <p className="text-xs text-white/70">
            {item.tracks} {item.tracks === 1 ? 'item' : 'items'}
          </p>
        </div>
      </div>
    </Tile>
  )
}

/* ------------------------------------------------------------------ */
/* Grid                                                                */
/* ------------------------------------------------------------------ */
const GRID_CLASS =
  'grid auto-rows-[150px] grid-flow-dense grid-cols-2 gap-3 p-4 md:auto-rows-[170px] md:grid-cols-4'

function GridSkeleton() {
  const sizes: Size[] = ['2x2', '1x1', '1x1', '2x1', '1x2', '2x1', '1x1']
  return (
    <div className={GRID_CLASS} aria-busy="true">
      {sizes.map((s, i) => (
        <div
          key={i}
          className={`${SIZE_CLASS[s]} animate-pulse rounded-2xl bg-zinc-800/60`}
        />
      ))}
    </div>
  )
}

export default function ProfileGrid({ items }: { items: HomeItem[] }) {
  const laidOut = assignSizes(items)

  // Every song on the grid forms the queue, so next/prev in the player works
  const queue: Song[] = items
    .filter((i): i is SongItem => i.type === 'song')
    .map((s) => ({
      id: s.id,
      title: s.title,
      artist: s.artist ?? '',
      src: s.audioUrl,
      cover: s.cover ?? undefined,
    }))

  if (laidOut.length === 0) {
    return (
      <p className="p-8 text-center text-sm opacity-70">Nothing here yet.</p>
    )
  }

  return (
    // grid-flow-dense backfills gaps left by bigger tiles
    <section className={GRID_CLASS}>
      {laidOut.map((item) => {
        const key = `${item.type}-${item.id}`
        switch (item.type) {
          case 'video':
            return <VideoTile key={key} item={item} />
          case 'song':
            return <SongTile key={key} item={item} queue={queue} />
          case 'photo':
            return <PhotoTile key={key} item={item} />
          case 'post':
            return <PostTile key={key} item={item} />
          case 'playlist':
            return <PlaylistTile key={key} item={item} />
        }
      })}
    </section>
  )
}
