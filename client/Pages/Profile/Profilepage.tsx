import { Outlet, useParams } from 'react-router'
import ProfileHeader from './Components/ProfileHeader'
import ProfileTopSection from './Components/ProfileTopSection'
import { useUserData } from '../../hooks'
import { ProfileLost } from './Profile404'
import { prominent } from 'color.js'
import { useEffect, useState } from 'react'

function Profile() {
  const [color1, setColor1] = useState('#ff0000')
  const [color2, setColor2] = useState('#0000ff')

  const { id } = useParams()

  const { data, isPending, isError, error, isSuccess } = useUserData(id ?? '')

  //const { data, isPending, isError, error } = useUserData(id ?? '', 'check')

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

  if (isPending) {
    return <div>Loading...</div>
  }

  if (isError) {
    return <ProfileLost></ProfileLost>
  }

  return (
    <div
      className="center_small rounded-xl p-4"
      style={{ backgroundColor: 'lab(3 0 0 / 0.71)' }}
    >
      {/*
      <div className="bg_bs_container">
        <img
          className="w-full absolute bg_bshit"
          alt="bg"
          src="http://localhost:5173/images/background.jpg"
        ></img>
      </div>
   */}
      {data.bg && (
        <div className="bgcontainerthing -z-10">
          <div className="bginnercont">
            <img className="w-full relative -z-10" alt="bg" src={data.bg}></img>
          </div>
        </div>
      )}

      <ProfileTopSection></ProfileTopSection>
      <ProfileHeader></ProfileHeader>
      {/*Much wow send props to all outlets so cool*/}
      <Outlet />
    </div>
  )
}

export default Profile
