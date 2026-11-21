import { Link } from 'react-router'

import {
  ArrowUpRight,
  FileText,
  Images,
  Lock,
  Music,
  Play,
  Video,
  type LucideIcon,
} from 'lucide-react'

export type PlaylistType = 'photos' | 'videos' | 'posts' | 'songs'

export interface PlaylistCardProps {
  type: PlaylistType
  title: string
  /** Number of items inside the playlist */
  count: number
  /** Cover image URLs. Photos use up to 4 as a mosaic; other types use the first. */
  covers?: string[]
  /** Fallback text cover for posts that have no image */
  excerpt?: string
  /** Human-readable, e.g. "2 days ago" */
  updatedAt?: string
  isPrivate?: boolean
  /** Renders an <a> when provided, otherwise a <button> */
  href?: string
  onClick?: () => void
  className?: string
}

const TYPES: Record<
  PlaylistType,
  {
    icon: LucideIcon
    action: LucideIcon
    singular: string
    plural: string
    aspect: string
  }
> = {
  photos: {
    icon: Images,
    action: ArrowUpRight,
    singular: 'photo',
    plural: 'photos',
    aspect: 'aspect-square',
  },
  videos: {
    icon: Video,
    action: Play,
    singular: 'video',
    plural: 'videos',
    aspect: 'aspect-video',
  },
  posts: {
    icon: FileText,
    action: ArrowUpRight,
    singular: 'post',
    plural: 'posts',
    aspect: 'aspect-square',
  },
  songs: {
    icon: Music,
    action: Play,
    singular: 'song',
    plural: 'songs',
    aspect: 'aspect-square',
  },
}

function Cover({
  type,
  covers,
  excerpt,
}: Pick<PlaylistCardProps, 'type' | 'covers' | 'excerpt'>) {
  const Icon = TYPES[type].icon
  const imgs = covers ?? []
  const zoom =
    'h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none'

  if (type === 'photos' && imgs.length >= 4) {
    return (
      <div className="grid h-full w-full grid-cols-2 grid-rows-2 gap-0.5">
        {imgs.slice(0, 4).map((src, i) => (
          <img
            key={i}
            src={src}
            alt=""
            loading="lazy"
            draggable={false}
            className={zoom}
          />
        ))}
      </div>
    )
  }

  if (imgs[0]) {
    return (
      <img
        src={imgs[0]}
        alt=""
        loading="lazy"
        draggable={false}
        className={zoom}
      />
    )
  }

  if (type === 'posts' && excerpt) {
    return (
      <p className="line-clamp-6 p-4 text-left text-sm leading-relaxed text-white/75">
        {excerpt}
      </p>
    )
  }

  return (
    <div className="grid h-full w-full place-items-center text-white/30">
      <Icon className="h-10 w-10" strokeWidth={1.5} />
    </div>
  )
}

export function PlaylistCard({
  type,
  title,
  count,
  covers,
  excerpt,
  updatedAt,
  isPrivate,
  href,
  onClick,
  className = '',
}: PlaylistCardProps) {
  const t = TYPES[type]
  const TypeIcon = t.icon
  const ActionIcon = t.action
  const countLabel = `${count} ${count === 1 ? t.singular : t.plural}`

  const shell = [
    'group block w-full rounded-2xl p-3 text-left',
    'bg-black/30 ring-1 ring-white/10 backdrop-blur-md',
    'transition-colors duration-200 hover:bg-black/45 hover:ring-white/25',
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-300',
    'motion-reduce:transition-none',
    className,
  ].join(' ')

  const body = (
    <>
      {/* Cover with stacked layers behind it, so it reads as a collection */}
      <div className="relative pt-3">
        <span
          aria-hidden
          className="absolute inset-x-6 top-0 h-3 rounded-t-xl bg-white/10"
        />
        <span
          aria-hidden
          className="absolute inset-x-3 top-1.5 h-3 rounded-t-xl bg-white/20"
        />

        <div
          className={`relative ${t.aspect} overflow-hidden rounded-xl bg-gradient-to-br from-white/10 to-white/[0.03]`}
        >
          <Cover type={type} covers={covers} excerpt={excerpt} />

          {/* Hover / focus action */}
          <div className="absolute inset-0 grid place-items-center bg-black/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-lime-300 text-black shadow-lg">
              <ActionIcon
                className="h-5 w-5"
                fill={t.action === Play ? 'currentColor' : 'none'}
              />
            </span>
          </div>

          {/* Count */}
          <span className="absolute bottom-2 right-2 flex items-center gap-1.5 rounded-md bg-black/70 px-2 py-1 text-xs font-medium text-white backdrop-blur">
            <TypeIcon className="h-3.5 w-3.5" />
            {countLabel}
          </span>
        </div>
      </div>

      {/* Text */}
      <div className="mt-3 min-w-0">
        <h3 className="truncate text-sm font-semibold text-white">{title}</h3>
        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-white/55">
          {isPrivate && (
            <Lock className="h-3 w-3 shrink-0" aria-label="Private" />
          )}
          <span className="truncate">
            {updatedAt ? `Updated ${updatedAt}` : t.plural}
          </span>
        </p>
      </div>
    </>
  )

  return href ? (
    <a href={href} className={shell}>
      {body}
    </a>
  ) : (
    <button type="button" onClick={onClick} className={shell}>
      {body}
    </button>
  )
}
