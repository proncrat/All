//import { useParams } from 'react-router'
import { Link, useParams } from 'react-router'
import { useVideos } from '../hooks'

function Video() {
  const { id } = useParams()

  const { data, isPending, isError, error } = useVideos(id)

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
      <h1>{data.title}</h1>
    </div>
  )
}

export default Video
