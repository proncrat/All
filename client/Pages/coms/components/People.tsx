import { useSession } from '@/lib/auth'
import { Usesessionid } from '@/client/hooks'
import { useGetFollowing } from '@/client/hooks/useFollow'
import { NavLink } from 'react-router'
import { useNewChat } from '@/client/hooks/useChat'

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

  //console.log(followersthing)

  const newChat = useNewChat()

  async function makeNewChat(data) {
    //console.log(data)
    await newChat.mutateAsync(data)
  }

  if (followpending) {
    return <p>Thinking</p>
  }

  return (
    <div className="pl-8 pr-8 pt-5">
      <p className="mb-4 text-lg ">People</p>
      <div className="flex flex-col gap-4">
        {followersthing.map((person) => (
          <button className={' rounded-lg  p-1 '} key={person.id}>
            <div className="flex justify-between">
              <div className="flex items-center gap-4  rounded-lg  ">
                <img
                  className="rounded-full w-12 aspect-square"
                  alt="some pfp"
                  src={person.pfp}
                />
                <p className="text-lg">{person.name}</p>
              </div>
              <div className="flex items-center mr-2">
                <button
                  onClick={() =>
                    makeNewChat({ ownerid: userId, recieverid: person.id })
                  }
                  className="border pl-3 pr-3 p-1 rounded-sm cursor-pointer   transition-all  hover:[box-shadow:0px_0px_4px_1px_rgba(255,255,255,0.74)_inset]"
                >
                  New chat
                </button>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
