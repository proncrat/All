import { useQuery } from '@tanstack/react-query'
import request from 'superagent'
import { useParams } from 'react-router'

const fetchProfileBasic = async (id) => {
  try {
    const response = await request.get(
      `http://localhost:3000/api/v1/profile/${id}`,
    )
    return response.body
  } catch (error) {
    throw new Error('Network response was not ok')
  }
}

function ProfileTopSection() {
  const { id } = useParams()

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['profile', id],
    queryFn: () => fetchProfileBasic(id),
  })

  if (isPending) {
    return <div>Loading...</div>
  }

  if (isError) {
    return <div>Error: {error.message}</div>
  }

  console.log(data)

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
