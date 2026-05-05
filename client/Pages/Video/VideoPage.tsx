//import { useParams } from 'react-router'
import { Link, useParams } from 'react-router'
import { useVideo } from '../../hooks'
import { AiFillLike } from 'react-icons/ai'

import { AiFillDislike } from 'react-icons/ai'

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
    <div className="center_small p-4">
      <video style={{ width: '80%' }} controls>
        <source src={data.video_link} type="video/mp4" />
      </video>
      <h1 className="text-2xl mb-3 mt-3">{data.name}</h1>
      <div className="mb-5 flex items-center gap-20">
        <Link to={'/profile/' + data.author_id}>
          <div className="flex gap-4">
            <img
              className="rounded-full w-12 aspect-square"
              alt="some pfp"
              src={data.pfp}
            />
            <div>
              <p className="text-lg">{data.username}</p>
              <p className="text-sm text-zinc-400">
                {data.followers} followers
              </p>
            </div>
          </div>
        </Link>
        <div className="flex gap-3">
          <AiFillLike size={'25px'} />
          <p>{data.likes}</p>
          <AiFillDislike size={'25px'} />
          <p>{data.dislikes}</p>
        </div>
      </div>

      <div className="flex gap-4 mb-3">
        <p>{data.views} views</p>
        <p>{new Date(data.post_date).toLocaleString()}</p>
      </div>
      <p>{data.description}</p>
    </div>
  )
}

export default Video
