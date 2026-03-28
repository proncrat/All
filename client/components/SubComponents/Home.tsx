import { Link, useParams } from 'react-router'
import { useUserData } from '../../hooks'

function Home() {
  const { id } = useParams()

  const { data, isPending, isError, error, isSuccess } = useUserData(
    id,
    'videos',
  )

  if (isPending) {
    return <div>Loading...</div>
  }

  if (isError) {
    return <div>Error: {error.message}</div>
  }

  if (data.length == 0) {
    return 'True adam error (No videos)'
  }

  if (isSuccess) {
    return (
      <div>
        <h2>Videos</h2>
        <div className="thumbnailcontainer">
          {data.map((item) => (
            <Link key={item.id} to={`/video/${item.id}`}>
              <div className="thumbnailthing">
                <img alt="A THUMBNAIL" src={item.thumbnail_link} />
                <p>{item.name}</p>
                <p>{item.views} views</p>
                <p>{item.author}</p>
                <p>{new Date(item.post_date).toLocaleDateString()}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    )
  }
}

export default Home
