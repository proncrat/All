//import { useParams } from 'react-router'
import { useParams } from 'react-router'
import { useVideo } from '../hooks'

function Video() {
  const { id } = useParams()
  const { data, isPending, isError, error } = useVideo(id)

  if (isPending) {
    return <div>Loading...</div>
  }

  if (isError) {
    return <div>Error: {error.message}</div>
  }

  if (data.length == 0) {
    return 'True adam error (No Results)'
  }

  return (
    <div>
      <video controls>
        <source src={data.video_link} type="video/mp4" />
      </video>
      <h1>{data.name}</h1>
      <p>{data.description}</p>
      <p>{data.post_date}</p>
      <p>Views : {data.views}</p>
    </div>
  )
}

export default Video
