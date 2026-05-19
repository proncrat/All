import { useChats, Usesessionid, useUserData } from '@/client/hooks'
import { useSession } from '@/lib/auth'
import { NavLink, Outlet, useParams } from 'react-router'
import { FaPhone } from 'react-icons/fa6'
import {
  answerCall,
  answercall2,
  init_calls,
  startCall,
} from './components/call'
import { Spinner } from '../Util/Spinner'

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

  const { data: userdata, isSuccess: userdataload } = useUserData(
    userid,
    '',
    !idpend,
  )

  const { data, isPending, isError, error, isSuccess } = useChats(
    userid,
    !idpend,
  )

  //console.log(data)
  let peer = null

  if (userdataload) {
    peer = init_calls(userdata.peer_id)
    answercall2(peer)
  }

  if (isPending) {
    return <Spinner></Spinner>
  }

  if (isError) {
    return <p>Something exploded</p>
  }

  return (
    <div className="flex h-full">
      <div
        style={{ width: '250px', height: '94vh' }}
        className=" shrink-0 border-r-2 p-4 gap-4 flex flex-col overflow-auto scrollbar hover:scrollbar-thin hover:scrollbar-thumb-zinc-400 hover:scrollbar-track-[lab(2.75381% 0 0)]"
      >
        {data.map((person, index) => (
          <NavLink
            className={'[&.active]:bg-mist-800 rounded-lg hover:bg-mist-800'}
            to={'/coms/' + person.chatid}
            key={index}
          >
            <div className="flex items-center gap-4  rounded-lg cursor-pointer ">
              <img
                className="rounded-full w-12 aspect-square"
                alt="some pfp"
                src={person.pfp}
              />
              <p className="text-lg">{person.name}</p>
            </div>
          </NavLink>
        ))}
      </div>
      <div className="h-full w-full">
        <div className="w-full h-10 border-b-2">
          <button
            onClick={() => startCall(peer, data[id - 1].peer_id)}
            className="cursor-pointer"
          >
            <FaPhone className="hover:fill-gray-500" size={'25px'} />
          </button>
        </div>
        <Outlet />
      </div>
    </div>
  )
}
