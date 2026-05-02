import { Outlet, useParams } from 'react-router'
import ProfileHeader from './Components/ProfileHeader'
import ProfileTopSection from './Components/ProfileTopSection'
import { useUserData } from '../../hooks'
import { ProfileLost } from './Profile404'
import { prominent } from 'color.js'
import { useEffect } from 'react'
import { PfBg } from './Components/Bg'

function Profile() {
  const { id } = useParams()

  const { data, isPending, isError, error, isSuccess } = useUserData(id ?? '')

  useEffect(() => {
    async function colorthingy() {
      const color = await prominent(data.bg, {
        format: 'hex',
      })
      console.log(color)
      document.body.style.backgroundColor = color[0]
      document.documentElement.style.setProperty('--after-color', color[0])
    }

    colorthingy()

    return () => {
      document.body.style.backgroundColor = ''
    }
  }, [isSuccess])

  if (isError) {
    return <ProfileLost></ProfileLost>
  }

  return (
    <div
      className="center_small rounded-xl p-4"
      style={{ backgroundColor: 'lab(3 0 0 / 0.71)' }}
    >
      <PfBg src={data} />
      <ProfileTopSection
        data={data}
        isPending={isPending}
        isError={isError}
        error={error}
        isSuccess={isSuccess}
      />
      <ProfileHeader></ProfileHeader>
      {/*Much wow send props to all outlets so cool*/}
      <Outlet />
    </div>
  )
}

export default Profile
