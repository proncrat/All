import { useNavigate } from 'react-router'
import { useSession } from '@/lib/auth'
//import { useCookies } from 'react-cookie'
import { Usesessionid } from '@/client/hooks'
import {
  useAddFollow,
  useDeleteFollow,
  useGetFollowing,
} from '@/client/hooks/useFollow'
import { useFetchId } from '@/client/hooks/useId'

function ProfileTopSection({ data, isPending, isError, error, isSuccess }) {
  //const [banner, setbanner] = useState(true)
  //const [banner2, setbanner2] = useState(true)
  //const [text, settext] = useState(true)
  /*
  const [cookies, setCookie, removeCookie] = useCookies(['id'])
  try {
    console.log(cookies.id)
  } catch {
    console.log('Hmmm')
  }
    */
  //sets cookie test
  //setCookie('id', 1, { path: '/' })

  const addFollow = useAddFollow()
  const unFollow = useDeleteFollow()

  const navigate = useNavigate()

  const { data: leId, loading: leLoading, error: leError } = useFetchId()

  const userId = leId.userid

  const { data: followersthing, isPending: followpending } = useGetFollowing(
    userId,
    !leLoading,
  )

  //console.log(userId)
  //console.log(followersthing)

  let followstatus = false

  if (!followpending && !isPending) {
    followstatus = followersthing.some(
      (follow) => follow.following_user_id === data.id,
    )
    //console.log(followstatus)
  }

  async function follow() {
    const thedata = {
      following_user_id: data.id,
      followed_user_id: userId,
      created_at: new Date(),
    }

    await addFollow.mutateAsync(thedata)
  }

  async function unfollow() {
    const thedata = {
      following_user_id: data.id,
      followed_user_id: userId,
    }

    await unFollow.mutateAsync(thedata)
  }

  if (isError) {
    return <div>Error: {error.message}</div>
  }

  return (
    <div className="mb-5">
      {/* Banner */}
      <div className="relative">
        {isPending && (
          <div className="w-full aspect-10/3 sm:aspect-10/2 bg-muted rounded-xl mb-3 sm:mb-5 shimmer shimmer-bg shimmer-duration-1500 shimmer-color-neutral-600 shimmer-repeat-delay-1000" />
        )}
        {isSuccess && data.banner && (
          <img
            className="w-full rounded-xl mb-3 sm:mb-5 aspect-10/3 sm:aspect-10/2 object-cover"
            alt="le banner"
            src={data.banner}
          />
        )}
      </div>

      <div className="flex justify-between gap-4">
        <div className="flex gap-3 sm:gap-4 min-w-0 flex-1">
          {/* Avatar */}
          <div className="relative shrink-0">
            {isPending && (
              <div className="w-20 sm:w-44 aspect-square bg-muted rounded-xl shimmer shimmer-bg shimmer-duration-1500 shimmer-color-neutral-600 shimmer-repeat-delay-1000" />
            )}
            {isSuccess && (
              <img
                className="rounded-xl aspect-square w-20 sm:w-44 object-cover"
                alt="pfp"
                src={data.pfp}
              />
            )}
          </div>

          {/* Name / stats / actions */}
          <div className="min-w-0 flex-1">
            {isPending && (
              <div>
                <div className="w-32 sm:w-40 h-7 bg-muted rounded-xl mb-3 sm:mb-4 shimmer shimmer-bg shimmer-duration-1500 shimmer-color-neutral-600 shimmer-repeat-delay-1000" />
                <div className="w-full max-w-60 h-5 bg-muted rounded-xl mb-2 shimmer shimmer-bg shimmer-duration-1500 shimmer-color-neutral-600 shimmer-repeat-delay-1000" />
                <div className="w-2/3 max-w-38 h-5 bg-muted rounded-xl mb-5 shimmer shimmer-bg shimmer-duration-1500 shimmer-color-neutral-600 shimmer-repeat-delay-1000" />
              </div>
            )}
            {isSuccess && (
              <div>
                {/* Name + level (level shown here on mobile only) */}
                <div className="flex items-baseline justify-between gap-2">
                  <h2 className="text-2xl sm:text-3xl font-bold truncate">
                    {data.name}
                  </h2>
                  <p className="text-sm whitespace-nowrap sm:hidden">
                    Level {data.level}
                  </p>
                </div>

                <div className="flex flex-wrap gap-x-3 sm:gap-x-4 text-sm sm:text-base">
                  <p>{`@${data.id}`}</p>
                  <p className="text-zinc-400 whitespace-nowrap">{`${data.followers} Followers`}</p>
                  <p className="text-zinc-400 whitespace-nowrap">{`${data.following} Following`}</p>
                </div>

                {data.describe && (
                  <p className="text-sm sm:text-base break-words">
                    {data.describe}
                  </p>
                )}

                <div className="flex flex-row gap-2">
                  {data.id == userId && (
                    <button
                      onClick={() => navigate('/settings/customize')}
                      className="abutton mt-2"
                    >
                      Customize
                    </button>
                  )}
                  {data.id !== userId && (
                    <div>
                      {!followstatus && (
                        <button onClick={follow} className="abutton mt-2">
                          Follow
                        </button>
                      )}
                      {followstatus && (
                        <button onClick={unfollow} className="abutton mt-2">
                          Unfollow
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Level (desktop only) */}
        <div className="hidden sm:block shrink-0">
          {isPending && (
            <div className="w-40 h-7 bg-muted rounded-xl shimmer shimmer-bg shimmer-duration-1500 shimmer-color-neutral-600 shimmer-repeat-delay-1000" />
          )}
          {isSuccess && (
            <p className="text-xl whitespace-nowrap">Level {data.level}</p>
          )}
        </div>
      </div>
    </div>
  )
}
export default ProfileTopSection
