import type { LibraryItem } from '@/client/apis/reactionsapi'
import type { Song } from '../Main/PlayerContext'

type CardItem = Pick<
  LibraryItem,
  'type' | 'id' | 'title' | 'author' | 'author_id' | 'media' | 'image'
>

/** Where clicking a library / playlist item should go. */
export function hrefFor(item: CardItem): string | null {
  switch (item.type) {
    case 'video':
      return `/video/${item.id}`
    case 'post':
      return `/posts/${item.id}`
    case 'photo':
      return item.author_id
        ? `/profile/${item.author_id}/Picture?photo=${item.id}`
        : null
    case 'song':
      return item.author_id ? `/profile/${item.author_id}/Song` : null
  }
}

export function toSong(item: CardItem): Song {
  return {
    id: item.id,
    title: item.title ?? 'Untitled',
    artist: item.author ?? '',
    src: item.media ?? '',
    cover: item.image ?? undefined,
  }
}

const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 31536000],
  ['month', 2592000],
  ['week', 604800],
  ['day', 86400],
  ['hour', 3600],
  ['minute', 60],
]

/** "2 days ago", "just now", ... Accepts ISO strings or epoch ms. */
export function timeAgo(value: string | number | Date | null | undefined) {
  if (value == null) return undefined
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return undefined
  const seconds = (date.getTime() - Date.now()) / 1000
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size)
      return rtf.format(Math.round(seconds / size), unit)
  }
  return 'just now'
}
