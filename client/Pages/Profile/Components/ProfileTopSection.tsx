import { useNavigate } from 'react-router'
import { useState } from 'react'
import { useSession } from '@/lib/auth'

function ProfileTopSection({ data, isPending, isError, error, isSuccess }) {
  const [banner, setbanner] = useState(true)
  const [banner2, setbanner2] = useState(true)

  const navigate = useNavigate()

  const { data: session } = useSession()

  if (isError) {
    return <div>Error: {error.message}</div>
  }

  return (
    <div className="mb-5">
      <div className="relative">
        {isSuccess && (
          <div>
            {data.banner && (
              <div>
                {banner && (
                  <div
                    style={{ aspectRatio: '10 / 2' }}
                    className="absolute w-full bg-muted rounded-xl mb-5 shimmer shimmer-bg shimmer-duration-1500 shimmer-color-neutral-600 shimmer-repeat-delay-1000"
                  />
                )}
                <img
                  onLoad={() => setbanner(false)}
                  className="w-full rounded-xl mb-5 aspect-10/2"
                  alt="le banner"
                  src={data.banner}
                />
              </div>
            )}
          </div>
        )}
      </div>
      <div className="flex justify-between">
        <div className="flex gap-4">
          <div className="relative">
            {banner2 && (
              <div
                style={{ aspectRatio: '1 / 1' }}
                className="absolute w-full bg-muted rounded-xl mb-5 shimmer shimmer-bg shimmer-duration-1500 shimmer-color-neutral-600 shimmer-repeat-delay-1000"
              />
            )}
            {isSuccess && (
              <img
                onLoad={() => setbanner2(false)}
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
                <div className="w-38 h-5 bg-muted rounded-xl mb-2 shimmer shimmer-bg shimmer-duration-1500 shimmer-color-neutral-600 shimmer-repeat-delay-1000" />
                <div className="w-38 h-5 bg-muted rounded-xl mb-5 shimmer shimmer-bg shimmer-duration-1500 shimmer-color-neutral-600 shimmer-repeat-delay-1000" />
              </div>
            )}
            {isSuccess && (
              <div>
                <h2 className="text-3xl font-bold">{data.name}</h2>
                <div className="flex gap-2">
                  <p>{`@${data.id}`}</p>
                  <p>·</p>
                  <p className="text-zinc-400">{`${data.followers} Followers`}</p>
                  <p>·</p>
                  <p className="text-zinc-400">{`${data.following} Following`}</p>
                </div>
                {data.describe && <p>{`${data.describe}`}</p>}

                <div className="flex flex-row gap-2">
                  {session && data.link_id == session.user.id && (
                    <button
                      onClick={() => navigate('/settings/customize')}
                      className="abutton mt-2"
                    >
                      Customize
                    </button>
                  )}
                  {session && data.link_id !== session.user.id && (
                    <button className="abutton mt-2">Follow</button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        {isSuccess && <p className="text-xl">Level {data.level}</p>}
      </div>
    </div>
  )
}
export default ProfileTopSection
