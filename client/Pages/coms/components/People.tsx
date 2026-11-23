import { useSession } from '@/lib/auth'
import { Usesessionid } from '@/client/hooks'
import { useGetFollowing } from '@/client/hooks/useFollow'
import { useNewChat } from '@/client/hooks/useChat'
import { NavLink, useNavigate } from 'react-router'

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

  const newChat = useNewChat()

  const navigate = useNavigate()

  async function makeNewChat(personId: number) {
    try {
      const { chatid } = await newChat.mutateAsync({ memberIds: [personId] })
      navigate(`/coms/${chatid}`)
    } catch (err) {
      window.alert((err as Error).message)
    }
  }

  if (followpending) {
    return <p>Thinking</p>
  }

  return (
    <div className="pl-8 pr-8 pt-5 h-full">
      <p className="mb-4 text-lg">People</p>
      <div className="flex flex-col gap-4">
        {followersthing.map((person) => (
          <div className="rounded-lg p-1" key={person.id}>
            <div className="flex justify-between">
              <NavLink
                to={`/profile/${person.id}`}
                className="flex items-center gap-4 rounded-lg"
              >
                <img
                  className="rounded-full w-12 aspect-square"
                  alt="some pfp"
                  src={person.pfp}
                />
                <p className="text-lg">{person.name}</p>
              </NavLink>
              <div className="flex items-center mr-2">
                <button
                  onClick={() =>
                    makeNewChat(person.id)
                  }
                  className="border pl-3 pr-3 p-1 rounded-sm cursor-pointer transition-all hover:[box-shadow:0px_0px_4px_1px_rgba(255,255,255,0.74)_inset]"
                >
                  New chat
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
