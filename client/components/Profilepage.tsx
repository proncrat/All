import { Outlet, useParams } from 'react-router'
import ProfileHeader from './ProfileHeader'
import ProfileTopSection from './ProfileTopSection'
import { useUserData } from '../hooks'

function Profile() {
  const { id } = useParams()

  const { data, isPending, isError, error, isSuccess } = useUserData(
    id,
    'check',
  )

  if (isPending) {
    return <div>Loading...</div>
  }

  if (isError) {
    return <div>Error: {error.message}</div>
  }

  if (data.valid == false) {
    return <p>No one here</p>
  }

  return (
    <div className="center_small">
      <ProfileTopSection></ProfileTopSection>
      <ProfileHeader></ProfileHeader>
      {/*Much wow send props to all outlets so cool*/}
      <Outlet />
    </div>
  )
}

export default Profile
