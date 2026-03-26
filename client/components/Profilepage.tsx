import { Outlet } from 'react-router'
import ProfileHeader from './ProfileHeader'
import ProfileTopSection from './ProfileTopSection'

function Profile() {
  return (
    <div /*style={{ width: '1400px', margin: 'auto' }}*/>
      <ProfileTopSection></ProfileTopSection>
      <ProfileHeader></ProfileHeader>
      {/*Much wow send props to all outlets so cool*/}
      <Outlet />
    </div>
  )
}

export default Profile
