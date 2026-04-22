import { Outlet, useParams } from 'react-router'
import ProfileHeader from './Components/ProfileHeader'
import ProfileTopSection from './Components/ProfileTopSection'
import { useUserData } from '../../hooks'
import { ProfileLost } from './Profile404'

function Profile() {
  const { id } = useParams()

  const { data, isPending, isError, error } = useUserData(id ?? '', 'check')

  if (isPending) {
    return <div>Loading...</div>
  }

  if (isError) {
    return <div>Error: {error.message}</div>
  }

  if (data.valid == false) {
    return <ProfileLost></ProfileLost>
  }

  return (
    <div
      className="center_small rounded-xl p-4"
      style={{ backgroundColor: 'lab(2.75381% 0 0/0.5)' }}
    >
      <img
        className="bg_bshit"
        alt="bg"
        src="http://localhost:5173/images/background.jpg"
      ></img>
      <ProfileTopSection></ProfileTopSection>
      <ProfileHeader></ProfileHeader>
      {/*Much wow send props to all outlets so cool*/}
      <Outlet />
    </div>
  )
}

export default Profile
