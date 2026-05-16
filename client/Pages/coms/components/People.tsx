import { useSession } from '@/lib/auth'
import { Usesessionid } from '@/client/hooks'
import { useGetFollowing } from '@/client/hooks/useFollow'
import { NavLink } from 'react-router'

export function People() {
  const { data: session, isPending: seshpend } = useSession()

  const userseshid = session?.session.userId

  const { data: idcheck, isPending: idpend } = Usesessionid(
    userseshid,
    !seshpend,
  )

  const userId = idcheck?.id

  const { data: followersthing, isPending: followpending } = useGetFollowing(
    userId,
    !idpend,
  )

  console.log(followersthing)

  if (followpending) {
    return <p>Thinking</p>
  }

  return (
    <div className="pl-8 pt-5">
      <p className="mb-4 text-lg ">People</p>
      <div className="flex flex-col gap-4">
        {followersthing.map((person) => (
          <button
            className={'[&.active]:bg-mist-800 rounded-lg hover:bg-mist-800'}
            key={person.id}
          >
            <div className="flex items-center gap-4  rounded-lg cursor-pointer ">
              <img
                className="rounded-full w-12 aspect-square"
                alt="some pfp"
                src={person.pfp}
              />
              <p className="text-lg">{person.name}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
