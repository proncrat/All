import { useChats, Usesessionid, useUserData } from '@/client/hooks'
import { useSession } from '@/lib/auth'
import { NavLink, Outlet, useNavigate, useParams } from 'react-router'
import { useChatUpdates, useLeaveChat } from '@/client/hooks/useChat'
import type { ChatSummary } from '@/client/apis/messagesapi'
import { ChatAvatar, chatTitle } from './components/ChatAvatar'
import { useNthParent } from '../Util/call/Context'
import { RxCross1 } from 'react-icons/rx'

// same outer shape as a real chat card, so nothing jumps when data arrives
function ChatSkeleton({ nameWidth }: { nameWidth: string }) {
  return (
    <div className="rounded-lg p-px bg-zinc-800/60 animate-pulse">
      <div className="rounded-lg bg-black w-full p-1">
        <div className="flex justify-between items-center pr-4">
          <div className="flex items-center gap-4 p-1">
            <div className="rounded-full w-9 aspect-square bg-zinc-800 shrink-0" />
            <div className={`h-4 rounded bg-zinc-800 ${nameWidth}`} />
          </div>
          <div className="size-4 rounded bg-zinc-800" />
        </div>
      </div>
    </div>
  )
}

const SKELETON_WIDTHS = ['w-24', 'w-16', 'w-28', 'w-20']

export function Coms() {
  const { id } = useParams()

  const { data: lesesh, isPending: seshpend } = useSession()
  const userseshid = lesesh?.session.userId

  const { data: idcheck, isPending: idpend } = Usesessionid(
    userseshid,
    !seshpend,
  )
  const userid = idcheck?.id

  const { handleChildAction } = useNthParent()

  const { data: userdata, isSuccess: userdataload } = useUserData(
    userid,
    '',
    !idpend,
  )

  const { data, isPending, isError } = useChats(userid, !idpend)

  // keep the list fresh when chats are created/joined/left elsewhere
  useChatUpdates()

  const navigate = useNavigate()
  const leaveChat = useLeaveChat()

  function deleteChat(chat: ChatSummary) {
    const ok = window.confirm(
      `Delete "${chatTitle(chat)}"? You'll leave the chat. Everyone else keeps it and its messages.`,
    )
    if (!ok) return
    leaveChat.mutate(chat.chatid, {
      onSuccess: () => {
        if (String(chat.chatid) === id) navigate('/coms')
      },
      onError: (err) => window.alert(err.message),
    })
  }

  return (
    <div className="flex h-full">
      <div
        className={`
        shrink-0 border-r border-zinc-800 p-3 gap-2 flex-col overflow-auto
        w-full md:w-[300px]
        ${id ? 'hidden md:flex' : 'flex'}
        scrollbar hover:scrollbar-thin hover:scrollbar-thumb-zinc-400 hover:scrollbar-track-[lab(2.75381% 0 0)]
      `}
      >
        <NavLink
          className={'[&.active]:bg-zinc-900 rounded-lg hover:bg-mist-800'}
          to={'/coms'}
          end
        >
          <div className="flex items-center gap-4  rounded-lg cursor-pointer p-1 pl-3">
            <p className="text-lg">Friends</p>
          </div>
        </NavLink>
        <p>Chats -</p>

        {isPending &&
          SKELETON_WIDTHS.map((w, i) => <ChatSkeleton key={i} nameWidth={w} />)}

        {isError && <p>Something exploded</p>}

        {data?.length === 0 && (
          <p className="text-sm text-zinc-500">
            No chats yet. Start one from Friends.
          </p>
        )}

        {data?.map((chat: ChatSummary) => (
          <div
            key={chat.chatid}
            className="animate-gradient-bg bg-linear-160 from-green-500 via-gray-700 to-gray-700 rounded-lg p-px"
          >
            <div className="rounded-lg bg-black w-full p-1 ">
              <NavLink
                className={
                  ' text-gray-500! hover:text-white! [&.active]:text-white! active:bg-position-[100%_30%] hover:bg-position-[100%_50%] bg-linear-to-br [&.active]:bg-position-[100%_70%] rounded-sm block from-black from-60% to-slate-600 bg-size-[200%_200%] bg-position-[100%_0%] transition-all'
                }
                to={'/coms/' + chat.chatid}
              >
                <div className="flex justify-between items-center pr-4 gap-2">
                  <div className="flex items-center gap-4 min-w-0 rounded-lg cursor-pointer p-1 ">
                    <ChatAvatar members={chat.members} />
                    <p className="text-lg truncate">{chatTitle(chat)}</p>
                  </div>
                  <button
                    type="button"
                    aria-label={`Delete chat ${chatTitle(chat)}`}
                    title="Delete chat"
                    disabled={leaveChat.isPending}
                    onClick={(e) => {
                      // the button sits inside the link; don't open the chat
                      e.preventDefault()
                      e.stopPropagation()
                      deleteChat(chat)
                    }}
                    className="cursor-pointer shrink-0"
                  >
                    <RxCross1 className="hover:text-red-500" size={'18px'} />
                  </button>
                </div>
              </NavLink>
            </div>
          </div>
        ))}
      </div>
      <div className={`min-w-0 w-full ${id ? 'block' : 'hidden md:block'}`}>
        <Outlet />
      </div>
    </div>
  )
}
