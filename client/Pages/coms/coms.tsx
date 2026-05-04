import { useChats, Usesessionid } from '@/client/hooks'
import { useSession } from '@/lib/auth'
import { NavLink, Outlet } from 'react-router'

export function Coms() {
  const { data: lesesh, isPending: seshpend } = useSession()

  const userseshid = lesesh?.session.userId

  const { data: idcheck, isPending: idpend } = Usesessionid(
    userseshid,
    !seshpend,
  )

  const userid = idcheck?.id

  console.log(userid)

  const { data, isPending, isError, error, isSuccess } = useChats(
    userid,
    !idpend,
  )

  console.log(data)

  if (isPending) {
    return <p>beans</p>
  }

  return (
    <div className="flex h-full">
      <div
        style={{ width: '250px', height: '94vh' }}
        className=" border-r-2 p-4 gap-4 flex flex-col overflow-auto scrollbar hover:scrollbar-thin hover:scrollbar-thumb-zinc-400 hover:scrollbar-track-[lab(2.75381% 0 0)]"
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
      <Outlet />
    </div>
  )
}
