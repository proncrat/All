//import { useParams } from 'react-router'
import { Link } from 'react-router'
import { useProfileAll } from '../../hooks'

function Search() {
  //const { id } = useParams()

  const { data, isPending, isError, error } = useProfileAll()

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
      {data.map((item) => (
        <div className="thumbnailthing" key={item.id}>
          <Link to={`/profile/${item.id}`}>
            <img alt="A THUMBNAIL" src={item.pfp} />
            <p>{item.name}</p>
          </Link>
        </div>
      ))}
    </div>
  )
}

export default Search
