import { Link } from 'react-router'

export function VideoCard({ data }) {
  return (
    <Link to={`/video/${data.id}`}>
      <div className="thumbnailthing rounded-xl ">
        <img
          style={{ aspectRatio: '16/9', width: '100%' }}
          alt="A THUMBNAIL"
          src={data.thumbnail_link}
          className="rounded-xl w-full"
        />
        <p>{data.name}</p>
        <p>{data.views} views</p>
        <p>{data.author}</p>
        <p>{new Date(data.post_date).toLocaleDateString()}</p>
      </div>
    </Link>
  )
}
