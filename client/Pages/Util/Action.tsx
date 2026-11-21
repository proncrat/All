import {
  Bookmark,
  ListPlus,
  Repeat2,
  Share2,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  type LucideIcon,
} from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { AddToPlaylistModal } from '../Playlist/AddToPlaylist'
import { useSession } from '@/lib/auth'
import { useReactions } from '@/client/hooks/usereactions'
import type { ReactionTarget, Vote } from '@/client/apis/reactionsapi'

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

/**
 * Like / dislike / repost / save bar for any video, post, photo or song.
 * Counts and the viewer's own state come from /api/v1/reactions and are
 * saved there; signed-out users are sent to the sign-in page.
 */
export function ReactionBar({
  type,
  id,
}: {
  type: ReactionTarget
  id: string | number | undefined | null
}) {
  const { data, act } = useReactions(type, id)
  const { data: session } = useSession()
  const navigate = useNavigate()
  const [playlistOpen, setPlaylistOpen] = useState(false)

  const vote = data?.vote ?? null
  const likes = data?.likes ?? 0
  const dislikes = data?.dislikes ?? 0
  const reposted = data?.reposted ?? false
  const reposts = data?.reposts ?? 0
  const saved = data?.saved ?? false
  const saves = data?.saves ?? 0
  const comments = data?.comments ?? 0

  /** Runs the action if signed in, otherwise goes to sign-in. */
  const ifSignedIn = (fn: () => void) => () => {
    if (!session) {
      navigate('/signin')
      return
    }
    if (data) fn()
  }

  const handleVote = (next: Vote) =>
    act({ kind: 'vote', vote: vote === next ? null : next })

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
        onClick={ifSignedIn(() => act({ kind: 'repost', active: !reposted }))}
      />

      <ActionButton
        icon={ThumbsUp}
        count={likes}
        label="Like"
        active={vote === 'like'}
        activeColor="text-pink-500"
        hover="hover:text-pink-500"
        fill
        onClick={ifSignedIn(() => handleVote('like'))}
      />

      <ActionButton
        icon={ThumbsDown}
        count={dislikes}
        label="Dislike"
        active={vote === 'dislike'}
        activeColor="text-orange-400"
        hover="hover:text-orange-400"
        fill
        onClick={ifSignedIn(() => handleVote('dislike'))}
      />

      <ActionButton
        icon={Bookmark}
        count={saves}
        label="Save"
        active={saved}
        activeColor="text-sky-400"
        hover="hover:text-sky-400"
        fill
        onClick={ifSignedIn(() => act({ kind: 'save', active: !saved }))}
      />

      <ActionButton
        icon={ListPlus}
        label="Add to playlist"
        hover="hover:text-lime-300"
        onClick={ifSignedIn(() => setPlaylistOpen(true))}
      />

      {playlistOpen && id != null && (
        <AddToPlaylistModal
          type={type}
          targetId={id}
          onClose={() => setPlaylistOpen(false)}
        />
      )}

      <ActionButton
        icon={Share2}
        label="Share"
        hover="hover:text-sky-400"
        onClick={() => navigator.clipboard.writeText(window.location.href)}
      />
    </div>
  )
}
