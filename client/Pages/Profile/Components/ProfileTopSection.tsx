import { useNavigate, useParams } from 'react-router'
import { useUserData } from '../../../hooks'
import { useEffect, useState } from 'react'
import { useSession } from '@/lib/auth'

function ProfileTopSection() {
  const [banner, setbanner] = useState(true)

  const { id } = useParams()
  const { data, isPending, isError, error } = useUserData(id ?? '')

  const navigate = useNavigate()

  const { data: session } = useSession()

  if (isPending) {
    return <div>Loading...</div>
  }
  if (isError) {
    return <div>Error: {error.message}</div>
  }
  return (
    <div className="mb-5">
      <div className="relative">
        {banner && (
          <div
            style={{ aspectRatio: '10 / 2' }}
            className="absolute w-full bg-muted rounded-xl mb-5 shimmer shimmer-bg shimmer-duration-1500 shimmer-color-neutral-600 shimmer-repeat-delay-1000"
          />
        )}
        <img
          onLoad={() => setbanner(false)}
          className="w-full rounded-xl mb-5"
          style={{ width: '100%', aspectRatio: '10 / 2' }}
          alt="le banner"
          src="http://localhost:3000/images/banner.jpg"
        />
      </div>
      <div id="imagesProfheader" className="flex">
        <img className="rounded-xl" alt="pfp" src={data.pfp} />
        <div className="ml-4">
          <h2 className="text-3xl font-bold">{data.name}</h2>
          <div className="flex gap-2">
            <p>{`@${data.id}`}</p>
            <p>·</p>
            <p className="text-zinc-400">{`${data.followers} Followers`}</p>
          </div>

          <p>{`YAP - ${data.describe}`}</p>
          <div className="flex flex-row gap-2">
            {session && data.link_id == session.user.id && (
              <button
                onClick={() => navigate('customize')}
                className="abutton mt-2"
              >
                Customize yo shit
              </button>
            )}
            <button className="abutton mt-2">Follow</button>
          </div>
        </div>
      </div>
    </div>
  )
}
export default ProfileTopSection
