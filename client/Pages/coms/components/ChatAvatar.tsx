import type { ChatMember, ChatSummary } from '@/client/apis/messagesapi'

/** Custom name, else the other members' names, else "Only you". */
export function chatTitle(chat: Pick<ChatSummary, 'name' | 'members'>) {
  if (chat.name) return chat.name
  const names = chat.members.map((m) => m.name)
  if (names.length === 0) return 'Only you'
  if (names.length <= 3) return names.join(', ')
  return `${names.slice(0, 2).join(', ')} +${names.length - 2}`
}

function Face({ member, className }: { member?: ChatMember; className: string }) {
  return member?.pfp ? (
    <img
      className={`rounded-full aspect-square object-cover ${className}`}
      alt=""
      src={member.pfp}
    />
  ) : (
    <div
      className={`rounded-full aspect-square bg-zinc-700 flex items-center justify-center text-xs uppercase ${className}`}
    >
      {member?.name?.[0] ?? '?'}
    </div>
  )
}

/** One face for a 1:1 chat, two overlapping faces for a group. */
export function ChatAvatar({
  members,
  size = 'w-9',
}: {
  members: ChatMember[]
  size?: string
}) {
  if (members.length <= 1)
    return <Face member={members[0]} className={`${size} shrink-0`} />
  return (
    <div className={`relative ${size} aspect-square shrink-0`}>
      <Face member={members[0]} className="absolute left-0 top-0 w-2/3" />
      <Face
        member={members[1]}
        className="absolute right-0 bottom-0 w-2/3 ring-2 ring-black"
      />
    </div>
  )
}
