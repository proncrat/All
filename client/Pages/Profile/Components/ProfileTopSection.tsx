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
      <div className="relative">
        {isPending && (
          <div
            style={{ aspectRatio: '10 / 2' }}
            className=" w-full bg-muted rounded-xl mb-5 shimmer shimmer-bg shimmer-duration-1500 shimmer-color-neutral-600 shimmer-repeat-delay-1000"
          />
        )}
        {isSuccess && (
          <div>
            {data.banner && (
              <img
                className="w-full rounded-xl mb-5 aspect-10/2"
                alt="le banner"
                src={data.banner}
              />
            )}
          </div>
        )}
      </div>
      <div className="flex justify-between">
        <div className="flex gap-4">
          <div className="relative">
            {isPending && (
              <div
                style={{ aspectRatio: '1 / 1' }}
                className=" w-44 bg-muted rounded-xl mb-5 shimmer shimmer-bg shimmer-duration-1500 shimmer-color-neutral-600 shimmer-repeat-delay-1000"
              />
            )}
            {isSuccess && (
              <img
                className="rounded-xl aspect-square w-44"
                alt="pfp"
                src={data.pfp}
              />
            )}
          </div>
          <div>
            {isPending && (
              <div>
                <div className="w-40 h-7 bg-muted rounded-xl mb-4 shimmer shimmer-bg shimmer-duration-1500 shimmer-color-neutral-600 shimmer-repeat-delay-1000" />
                <div className="w-60 h-5 bg-muted rounded-xl mb-2 shimmer shimmer-bg shimmer-duration-1500 shimmer-color-neutral-600 shimmer-repeat-delay-1000" />
                <div className="w-38 h-5 bg-muted rounded-xl mb-5 shimmer shimmer-bg shimmer-duration-1500 shimmer-color-neutral-600 shimmer-repeat-delay-1000" />
              </div>
            )}
            {isSuccess && (
              <div>
                <h2 className="text-3xl font-bold">{data.name}</h2>
                <div className="flex gap-4">
                  <p>{`@${data.id}`}</p>
                  <p className="text-zinc-400">{`${data.followers} Followers`}</p>
                  <p className="text-zinc-400">{`${data.following} Following`}</p>
                </div>
                {data.describe && <p>{`${data.describe}`}</p>}

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
        <div>
          {isPending && (
            <div className="w-40 h-7 bg-muted rounded-xl mb-4 shimmer shimmer-bg shimmer-duration-1500 shimmer-color-neutral-600 shimmer-repeat-delay-1000" />
          )}
          {isSuccess && <p className="text-xl">Level {data.level}</p>}
        </div>
      </div>
    </div>
  )
}
export default ProfileTopSection
