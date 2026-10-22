import { useChats, Usesessionid, useUserData } from '@/client/hooks'
import { useSession } from '@/lib/auth'
import { NavLink, Outlet, useParams } from 'react-router'
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

        {data?.map((person, index) => (
          <div
            key={index}
            className="animate-gradient-bg bg-linear-160 from-green-500 via-gray-700 to-gray-700 rounded-lg p-px"
          >
            <div className="rounded-lg bg-black w-full p-1 ">
              <NavLink
                className={
                  ' text-gray-500! hover:text-white! [&.active]:text-white! active:bg-position-[100%_30%] hover:bg-position-[100%_50%] bg-linear-to-br [&.active]:bg-position-[100%_70%] rounded-sm block from-black from-60% to-slate-600 bg-size-[200%_200%] bg-position-[100%_0%] transition-all'
                }
                to={'/coms/' + person.chatid}
              >
                <div className="flex justify-between pr-4 ">
                  <div className="flex items-center gap-4  rounded-lg cursor-pointer p-1 ">
                    <img
                      className="rounded-full w-9 aspect-square"
                      alt="some pfp"
                      src={person.pfp}
                    />
                    <p className="text-lg">{person.name}</p>
                  </div>
                  <button className="cursor-pointer">
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
