import { useParams } from 'react-router'
import { useProfile } from '../hooks'

function ProfileTopSection() {
  const { id } = useParams()
  const { data, isPending, isError, error } = useProfile(id)
  if (isPending) {
    return <div>Loading...</div>
  }
  if (isError) {
    return <div>Error: {error.message}</div>
  }
  return (
    <div className="flex">
      <img alt="pfp" src={data.pfp} />
      <div>
        <h2>{data.name}</h2>
        <p>{`${data.followers} Followers`}</p>
        <p>{`YAP - ${data.describe}`}</p>
      </div>
    </div>
  )
}
export default ProfileTopSection
