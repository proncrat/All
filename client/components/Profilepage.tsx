import { Outlet } from 'react-router'
import ProfileHeader from './ProfileHeader'
import ProfileTopSection from './ProfileTopSection'
import { THEHEADER } from './SubComponents/MainHeader'

function Profile() {
  return (
    <div>
      <THEHEADER />
      <div /*style={{ width: '1400px', margin: 'auto' }}*/>
        <ProfileTopSection></ProfileTopSection>
        <ProfileHeader></ProfileHeader>
        {/*Much wow send props to all outlets so cool*/}
        <Outlet />
      </div>
    </div>
  )
}

export default Profile
