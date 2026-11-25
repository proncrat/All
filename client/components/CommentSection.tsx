import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import {
  ChevronDown,
  ChevronUp,
  Send,
  ThumbsDown,
  ThumbsUp,
  Trash2,
} from 'lucide-react'
import { useSession } from '@/lib/auth'
import { useComments, Usesessionid } from '@/client/hooks'
import {
  useAddComment,
  useDeleteComment,
  useVoteComment,
} from '@/client/hooks/usecomments'
import type { comment } from '@/client/models/comment'

const fmt = (n: number) =>
  new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(n)

function formatDate(d: string | Date) {
  const date = new Date(d)
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })}`
}

/**
 * Comments for any target (profile, post, photo, ...): top-level comments
 * newest first, one level of replies under each, like/dislike on every
 * comment, and delete on your own.
 */
export function CommentSection({
  linkType,
  linkId,
  composer = 'bottom',
  className = '',
  listClassName = '',
}: {
  linkType: string
  linkId: string | number | undefined
  composer?: 'top' | 'bottom'
  className?: string
  listClassName?: string
}) {
  const { data, isPending, isError, error } = useComments(
    linkId as string,
    linkType,
  )
  const { data: session } = useSession()
  const { data: me } = Usesessionid(
    session?.session.userId as string,
    Boolean(session),
  )
  const addComment = useAddComment()
  const navigate = useNavigate()

  const comments: comment[] = Array.isArray(data) ? data : []
  const { topLevel, replies } = useMemo(() => {
    const replies = new Map<number, comment[]>()
    const topLevel: comment[] = []
    for (const c of comments) {
      if (c.parent_id == null) topLevel.push(c)
      else replies.set(c.parent_id, [...(replies.get(c.parent_id) ?? []), c])
    }
    // replies read top to bottom, oldest first
    for (const list of replies.values()) list.sort((a, b) => a.id - b.id)
    return { topLevel, replies }
  }, [comments])

  const signedIn = Boolean(session && me)
  const requireSignIn = () => {
    if (!signedIn) navigate('/signin')
    return signedIn
  }

  async function post(text: string, parentId: number | null = null) {
    if (!requireSignIn() || linkId == null) return false
    await addComment.mutateAsync({
      link_type: linkType,
      link_id: linkId,
      body_text: text,
      parent_id: parentId,
    })
    return true
  }

  const form = (
    <Composer
      placeholder={signedIn ? 'Add a comment' : 'Sign in to comment'}
      disabled={!signedIn}
      pending={addComment.isPending}
      onSubmit={(text) => post(text)}
      className={
        composer === 'top'
          ? 'mb-4'
          : 'border-t border-white/10 pt-3 mt-auto shrink-0'
      }
    />
  )

  return (
    <div className={`flex min-h-0 flex-col ${className}`}>
      {composer === 'top' && form}

      <div
        className={`min-h-0 scrollbar scrollbar-thin scrollbar-thumb-zinc-600 scrollbar-track-transparent hover:scrollbar-thumb-zinc-400 ${listClassName}`}
      >
        {isPending ? (
          <p className="py-6 text-center text-sm text-white/40">
            Loading comments...
          </p>
        ) : isError ? (
          <p className="py-6 text-center text-sm text-red-400">
            Error: {error.message}
          </p>
        ) : topLevel.length === 0 ? (
          <p className="py-6 text-center text-sm text-white/40">
            No comments yet.
          </p>
        ) : (
          <ul className="space-y-4">
            {topLevel.map((c) => (
              <CommentItem
                key={c.id}
                c={c}
                replies={replies.get(c.id) ?? []}
                myId={me?.id}
                requireSignIn={requireSignIn}
                onReply={(text) => post(text, c.id)}
                replyPending={addComment.isPending}
              />
            ))}
          </ul>
        )}
      </div>

      {composer === 'bottom' && form}
    </div>
  )
}

function CommentItem({
  c,
  replies,
  myId,
  requireSignIn,
  onReply,
  replyPending,
}: {
  c: comment
  replies: comment[]
  myId: number | undefined
  requireSignIn: () => boolean
  onReply: (text: string) => Promise<boolean>
  replyPending: boolean
}) {
  const [replying, setReplying] = useState<string | null>(null) // prefill text
  const [showReplies, setShowReplies] = useState(false)

  function startReply(to?: comment) {
    if (!requireSignIn()) return
    setReplying(to && to.authorId !== myId ? `@${to.name} ` : '')
  }

  return (
    <li>
      <CommentBody
        c={c}
        myId={myId}
        requireSignIn={requireSignIn}
        onReply={() => startReply()}
      />

      <div className="ml-11">
        {replying !== null && (
          <Composer
            autoFocus
            initial={replying}
            placeholder={`Reply to ${c.name}`}
            pending={replyPending}
            onCancel={() => setReplying(null)}
            onSubmit={async (text) => {
              const ok = await onReply(text)
              if (ok) {
                setReplying(null)
                setShowReplies(true)
              }
              return ok
            }}
            className="mt-2"
          />
        )}

        {replies.length > 0 && (
          <button
            type="button"
            onClick={() => setShowReplies((s) => !s)}
            className="mt-1 flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold text-sky-400 hover:bg-sky-400/10"
          >
            {showReplies ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
          </button>
        )}

        {showReplies && replies.length > 0 && (
          <ul className="mt-2 space-y-3">
            {replies.map((r) => (
              <li key={r.id}>
                <CommentBody
                  c={r}
                  small
                  myId={myId}
                  requireSignIn={requireSignIn}
                  onReply={() => startReply(r)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </li>
  )
}

function CommentBody({
  c,
  small = false,
  myId,
  requireSignIn,
  onReply,
}: {
  c: comment
  small?: boolean
  myId: number | undefined
  requireSignIn: () => boolean
  onReply: () => void
}) {
  const vote = useVoteComment()
  const del = useDeleteComment()
  const mine = myId != null && myId === c.authorId
  const avatar = small ? 'h-6 w-6 text-[10px]' : 'h-8 w-8 text-xs'

  const castVote = (next: 'like' | 'dislike') => {
    if (!requireSignIn()) return
    vote.mutate({ id: c.id, vote: c.vote === next ? null : next })
  }

  const handleDelete = () => {
    const msg =
      c.parent_id == null
        ? 'Delete this comment and its replies?'
        : 'Delete this reply?'
    if (window.confirm(msg)) del.mutate(c.id)
  }

  return (
    <div className="group flex gap-3 text-sm">
      {c.pfp ? (
        <img
          src={c.pfp}
          alt=""
          className={`${avatar} shrink-0 rounded-full object-cover`}
        />
      ) : (
        <div
          className={`${avatar} flex shrink-0 items-center justify-center rounded-full bg-white/10 font-semibold uppercase`}
        >
          {c.name?.[0] ?? '?'}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="truncate font-semibold text-white">{c.name}</span>
          <time
            dateTime={new Date(c.post_date).toISOString()}
            className="shrink-0 text-xs text-neutral-500"
          >
            {formatDate(c.post_date)}
          </time>
        </div>
        <p className="mt-0.5 whitespace-pre-line break-words text-white/80">
          {c.body_text}
        </p>

        <div className="mt-1 -ml-1.5 flex items-center gap-1 text-xs text-neutral-500">
          <VoteButton
            label="Like"
            active={c.vote === 'like'}
            count={c.likes}
            activeColor="text-pink-500"
            hover="hover:text-pink-500"
            onClick={() => castVote('like')}
          >
            <ThumbsUp
              size={14}
              className={c.vote === 'like' ? 'fill-current' : ''}
            />
          </VoteButton>
          <VoteButton
            label="Dislike"
            active={c.vote === 'dislike'}
            count={c.dislikes}
            activeColor="text-orange-400"
            hover="hover:text-orange-400"
            onClick={() => castVote('dislike')}
          >
            <ThumbsDown
              size={14}
              className={c.vote === 'dislike' ? 'fill-current' : ''}
            />
          </VoteButton>
          <button
            type="button"
            onClick={onReply}
            className="rounded-full px-2 py-1 font-semibold hover:bg-white/10 hover:text-white"
          >
            Reply
          </button>
        </div>
      </div>

      {mine && (
        <button
          type="button"
          aria-label="Delete comment"
          onClick={handleDelete}
          disabled={del.isPending}
          className="h-fit shrink-0 rounded-full p-1.5 text-white/30 opacity-60 transition group-hover:opacity-100 hover:bg-white/10 hover:text-red-400 disabled:opacity-50"
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  )
}

function VoteButton({
  label,
  active,
  count,
  activeColor,
  hover,
  onClick,
  children,
}: {
  label: string
  active: boolean
  count: number
  activeColor: string
  hover: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={`flex items-center gap-1 rounded-full px-1.5 py-1 transition-colors hover:bg-white/10 ${
        active ? activeColor : hover
      }`}
    >
      {children}
      {count > 0 && <span className="tabular-nums">{fmt(count)}</span>}
    </button>
  )
}

function Composer({
  placeholder,
  disabled = false,
  pending,
  initial = '',
  autoFocus = false,
  onSubmit,
  onCancel,
  className = '',
}: {
  placeholder: string
  disabled?: boolean
  pending: boolean
  initial?: string
  autoFocus?: boolean
  onSubmit: (text: string) => Promise<boolean>
  onCancel?: () => void
  className?: string
}) {
  const [text, setText] = useState(initial)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    if (await onSubmit(trimmed)) setText('')
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex items-center gap-2 ${className}`}
    >
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          // Esc cancels a reply instead of closing a surrounding lightbox
          if (e.key === 'Escape' && onCancel) {
            e.stopPropagation()
            onCancel()
          }
        }}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        autoComplete="off"
        maxLength={255}
        className="min-w-0 flex-1 rounded-full bg-white/5 px-4 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
      />
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full px-3 py-1.5 text-xs text-white/60 hover:bg-white/10 hover:text-white"
        >
          Cancel
        </button>
      )}
      <button
        type="submit"
        aria-label="Post comment"
        disabled={disabled || pending || !text.trim()}
        className="rounded-full p-2 text-white/60 transition hover:bg-white/10 hover:text-white disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-white/60"
      >
        <Send size={16} />
      </button>
    </form>
  )
}
