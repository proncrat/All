import { useChats, Usesessionid, useUserData } from '@/client/hooks'
import { useSession } from '@/lib/auth'
import { NavLink, Outlet, useParams } from 'react-router'
import { Spinner } from '../Util/Spinner'
import { useNthParent } from '../Util/call/Context'
import { RxCross1 } from 'react-icons/rx'

export function Coms() {
  const { id } = useParams()

  const { data: lesesh, isPending: seshpend } = useSession()

  const userseshid = lesesh?.session.userId

  const { data: idcheck, isPending: idpend } = Usesessionid(
    userseshid,
    !seshpend,
  )

  const userid = idcheck?.id

  //console.log(userid)

  const { handleChildAction } = useNthParent()

  const { data: userdata, isSuccess: userdataload } = useUserData(
    userid,
    '',
    !idpend,
  )

  const { data, isPending, isError, error, isSuccess } = useChats(
    userid,
    !idpend,
  )

  if (isPending) {
    return <Spinner></Spinner>
  }

  if (isError) {
    return <p>Something exploded</p>
  }

  return (
    <div className="flex h-full">
      <div
        style={{ width: '300px' }}
        className="bg-black shrink-0 border-r-2 p-4 gap-4 flex flex-col overflow-auto scrollbar hover:scrollbar-thin hover:scrollbar-thumb-zinc-400 hover:scrollbar-track-[lab(2.75381% 0 0)]"
      >
        <NavLink
          className={'[&.active]:bg-mist-800 rounded-lg hover:bg-mist-800'}
          to={'/coms'}
          end
        >
          <div className="flex items-center gap-4  rounded-lg cursor-pointer p-1 pl-3">
            <p className="text-lg">Friends</p>
          </div>
        </NavLink>
        <p>Chats -</p>
        {data.map((person, index) => (
          <div
            key={index}
            className="animate-gradient-bg bg-linear-160 from-green-500 via-gray-700 to-gray-700 rounded-lg p-px"
          >
            <div className="rounded-lg bg-black w-full p-1 ">
              <NavLink
                className={
                  'hover:bg-position-[100%_50%] bg-linear-to-br [&.active]:bg-position-[100%_70%] rounded-sm block from-black from-60% to-slate-600 bg-size-[200%_200%] bg-position-[100%_0%] transition-all'
                }
                to={'/coms/' + person.chatid}
              >
                <div className="flex justify-between pr-4 ">
                  <div className="flex items-center gap-4  rounded-lg cursor-pointer p-1 ">
                    <img
                      className="rounded-full w-10 aspect-square"
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
      <div className="w-full">
        <Outlet />
      </div>
    </div>
  )
}
