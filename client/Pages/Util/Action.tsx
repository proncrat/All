import {
  Bookmark,
  Repeat2,
  Share2,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  type LucideIcon,
} from 'lucide-react'
import { useState } from 'react'

const fmt = (n: number) =>
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
}: {
  icon: LucideIcon
  count?: number
  label: string
  active?: boolean
  hover: string
  activeColor?: string
  fill?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
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

export function ReactionBar({ photo }: { photo: Photo }) {
  const [vote, setVote] = useState<'like' | 'dislike' | null>(
    photo.vote ?? null,
  )
  const [likes, setLikes] = useState(photo.likes ?? 0)
  const [dislikes, setDislikes] = useState(photo.dislikes ?? 0)

  const [reposted, setReposted] = useState(photo.reposted ?? false)
  const [reposts, setReposts] = useState(photo.reposts ?? 0)
  const [saved, setSaved] = useState(photo.saved ?? false)
  const [saves, setSaves] = useState(photo.saves ?? 0)

  const [comments, setComments] = useState(photo.comments ?? 0)

  function handleVote(type: 'like' | 'dislike') {
    let nextLikes = likes - (vote === 'like' ? 1 : 0)
    let nextDislikes = dislikes - (vote === 'dislike' ? 1 : 0)
    let nextVote: 'like' | 'dislike' | null = null

    if (vote !== type) {
      nextVote = type
      if (type === 'like') nextLikes += 1
      else nextDislikes += 1
    }

    setVote(nextVote)
    setLikes(nextLikes)
    setDislikes(nextDislikes)
  }

  return (
    <div className="flex items-center justify-between">
      <ActionButton
        icon={MessageCircle}
        count={comments}
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
        icon={ThumbsUp}
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
        onClick={() => navigator.clipboard.writeText(window.location.href)}
      />
    </div>
  )
}
