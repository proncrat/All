import { useQuery } from '@tanstack/react-query'
import request from 'superagent'
interface prof {
  name: string
}

const fetchProfileBasic = async () => {
  try {
    const response = await request.get('http://localhost:3000/api/v0.1/profile')
    return response.body
  } catch (error) {
    throw new Error('Network response was not ok')
  }
}

function ProfileTopSection(props: prof) {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['profile', props.name],
    queryFn: fetchProfileBasic,
  })

  if (isPending) {
    return <div>Loading...</div>
  }

  if (isError) {
    return <div>Error: {error.message}</div>
  }

  return (
    <div className="flex">
      <img
        alt="pfp"
        src="https://images.pexels.com/photos/14653174/pexels-photo-14653174.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
      />
      <div>
        <h2>{data.name}</h2>
        <p>{`${data.followers} Followers`}</p>
      </div>
    </div>
  )
}

export default ProfileTopSection
