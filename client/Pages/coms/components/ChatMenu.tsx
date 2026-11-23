import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import {
  IoEllipsisHorizontal,
  IoPersonAddOutline,
  IoTrashOutline,
  IoPeopleOutline,
  IoCloseOutline,
  IoPersonRemoveOutline,
} from 'react-icons/io5'
import type { ChatMember } from '@/client/apis/messagesapi'
import { useGetFollowing } from '@/client/hooks/useFollow'
import {
  useAddChatMembers,
  useLeaveChat,
  useRemoveChatMember,
} from '@/client/hooks/useChat'

interface Props {
  chatId: string
  title: string
  members: ChatMember[] // everyone in the chat, including you
  myId: number | undefined
}

type Panel = null | 'menu' | 'add' | 'members'

// A follows row joined with profiledata (see getFollowingById on the server)
interface FollowRow {
  id: number
  following_user_id?: number
  name: string
  pfp: string | null
}

/** The "⋯" button in the chat header: add people, see members, delete chat. */
export function ChatMenu({ chatId, title, members, myId }: Props) {
  const [panel, setPanel] = useState<Panel>(null)
  const boxRef = useRef<HTMLDivElement>(null)

  // Close on outside click or Escape
  useEffect(() => {
    if (!panel) return
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node))
        setPanel(null)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setPanel(null)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [panel])

  const navigate = useNavigate()
  const leaveChat = useLeaveChat()

  function deleteChat() {
    setPanel(null)
    const ok = window.confirm(
      `Delete "${title}"? You'll leave the chat. Everyone else keeps it and its messages.`,
    )
    if (!ok) return
    leaveChat.mutate(chatId, {
      onSuccess: () => navigate('/coms'),
      onError: (err) => window.alert(err.message),
    })
  }

  const item =
    'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition cursor-pointer'

  return (
    <div ref={boxRef} className="relative ml-auto">
      <button
        type="button"
        onClick={() => setPanel((p) => (p ? null : 'menu'))}
        aria-label="Chat options"
        aria-haspopup="menu"
        aria-expanded={panel != null}
        className={`p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer ${
          panel ? 'bg-white/10 text-white' : ''
        }`}
      >
        <IoEllipsisHorizontal size={20} />
      </button>

      {panel === 'menu' && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-1 z-30 w-48 overflow-hidden rounded-lg border border-white/10 bg-zinc-900 p-1 shadow-xl shadow-black/50"
        >
          <button
            role="menuitem"
            onClick={() => setPanel('add')}
            className={`${item} text-zinc-200 hover:bg-white/10`}
          >
            <IoPersonAddOutline size={16} />
            Add people
          </button>
          <button
            role="menuitem"
            onClick={() => setPanel('members')}
            className={`${item} text-zinc-200 hover:bg-white/10`}
          >
            <IoPeopleOutline size={16} />
            Members ({members.length})
          </button>
          <button
            role="menuitem"
            onClick={deleteChat}
            disabled={leaveChat.isPending}
            className={`${item} text-red-400 hover:bg-red-500/10`}
          >
            <IoTrashOutline size={16} />
            Delete chat
          </button>
        </div>
      )}

      {panel === 'add' && (
        <AddPeople
          chatId={chatId}
          members={members}
          myId={myId}
          onClose={() => setPanel(null)}
        />
      )}

      {panel === 'members' && (
        <Members
          chatId={chatId}
          members={members}
          myId={myId}
          onClose={() => setPanel(null)}
        />
      )}
    </div>
  )
}

function PanelShell({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <div className="absolute right-0 top-full mt-1 z-30 w-72 max-w-[calc(100vw-2rem)] rounded-lg border border-white/10 bg-zinc-900 p-3 shadow-xl shadow-black/50">
      <div className="mb-2 flex items-center justify-between">
        <p className="font-semibold">{title}</p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="rounded-md p-1 text-zinc-400 hover:bg-white/10 hover:text-white cursor-pointer"
        >
          <IoCloseOutline size={18} />
        </button>
      </div>
      <div className="max-h-72 overflow-auto">{children}</div>
    </div>
  )
}

function Avatar({ member }: { member: { name: string; pfp: string | null } }) {
  return member.pfp ? (
    <img
      src={member.pfp}
      alt=""
      className="w-8 aspect-square rounded-full object-cover shrink-0"
    />
  ) : (
    <div className="w-8 aspect-square rounded-full bg-zinc-700 flex items-center justify-center text-xs uppercase shrink-0">
      {member.name?.[0] ?? '?'}
    </div>
  )
}

/** Member list; the chat's creator gets a remove button next to everyone else. */
function Members({
  chatId,
  members,
  myId,
  onClose,
}: {
  chatId: string
  members: ChatMember[]
  myId: number | undefined
  onClose: () => void
}) {
  const removeMember = useRemoveChatMember(chatId)
  const iAmCreator = members.some((m) => m.id === myId && m.is_creator)

  function remove(member: ChatMember) {
    const ok = window.confirm(
      `Remove ${member.name} from the chat? Their messages will stay.`,
    )
    if (ok) removeMember.mutate(member.id)
  }

  return (
    <PanelShell title={`Members (${members.length})`} onClose={onClose}>
      <ul className="flex flex-col gap-1">
        {members.map((m) => (
          <li key={m.id} className="flex items-center gap-1">
            <Link
              to={`/profile/${m.id}`}
              className="flex min-w-0 flex-1 items-center gap-3 rounded-md p-1.5 hover:bg-white/5"
            >
              <Avatar member={m} />
              <span className="truncate">
                {m.name}
                {m.id === myId && <span className="text-zinc-500"> (you)</span>}
              </span>
              {m.is_creator && (
                <span className="ml-auto shrink-0 text-xs text-zinc-500">
                  Creator
                </span>
              )}
            </Link>
            {iAmCreator && m.id !== myId && (
              <button
                type="button"
                onClick={() => remove(m)}
                disabled={removeMember.isPending}
                aria-label={`Remove ${m.name}`}
                title="Remove from chat"
                className="shrink-0 rounded-md p-1.5 text-zinc-400 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50 cursor-pointer"
              >
                <IoPersonRemoveOutline size={16} />
              </button>
            )}
          </li>
        ))}
      </ul>

      {removeMember.isError && (
        <p role="alert" className="mt-2 text-sm text-red-400">
          {removeMember.error.message}
        </p>
      )}
    </PanelShell>
  )
}

/** Pick people you follow who aren't in the chat yet. */
function AddPeople({
  chatId,
  members,
  myId,
  onClose,
}: {
  chatId: string
  members: ChatMember[]
  myId: number | undefined
  onClose: () => void
}) {
  const { data: following, isPending } = useGetFollowing(myId, myId != null)
  const addMembers = useAddChatMembers(chatId)
  const [picked, setPicked] = useState<number[]>([])

  const inChat = new Set(members.map((m) => m.id))
  const candidates: { id: number; name: string; pfp: string | null }[] = (
    (following ?? []) as FollowRow[]
  )
    .map((p: FollowRow) => ({
      // follows rows are joined with profiledata; following_user_id is the profile
      id: Number(p.following_user_id ?? p.id),
      name: p.name,
      pfp: p.pfp,
    }))
    .filter((p) => !inChat.has(p.id))

  const toggle = (id: number) =>
    setPicked((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )

  async function submit() {
    try {
      await addMembers.mutateAsync(picked)
      onClose()
    } catch {
      // shown below via addMembers.error
    }
  }

  return (
    <PanelShell title="Add people" onClose={onClose}>
      {isPending && <p className="text-sm text-zinc-400">Loading…</p>}

      {!isPending && candidates.length === 0 && (
        <p className="text-sm text-zinc-400">
          Everyone you follow is already here. Follow more people to add them.
        </p>
      )}

      <ul className="flex flex-col gap-1">
        {candidates.map((p) => (
          <li key={p.id}>
            <label className="flex items-center gap-3 rounded-md p-1.5 hover:bg-white/5 cursor-pointer">
              <input
                type="checkbox"
                checked={picked.includes(p.id)}
                onChange={() => toggle(p.id)}
                className="accent-white"
              />
              <Avatar member={p} />
              <span className="truncate">{p.name}</span>
            </label>
          </li>
        ))}
      </ul>

      {candidates.length > 0 && (
        <button
          type="button"
          onClick={submit}
          disabled={picked.length === 0 || addMembers.isPending}
          className="mt-3 w-full rounded-md bg-white px-3 py-2 text-sm font-semibold text-black hover:bg-white/85 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
        >
          {addMembers.isPending
            ? 'Adding…'
            : picked.length
              ? `Add ${picked.length}`
              : 'Add'}
        </button>
      )}

      {addMembers.isError && (
        <p role="alert" className="mt-2 text-sm text-red-400">
          {addMembers.error.message}
        </p>
      )}
    </PanelShell>
  )
}
