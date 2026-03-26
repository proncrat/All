//import { useParams } from 'react-router'
import { Link } from 'react-router'
import { useProfileAll } from '../hooks'

function Home() {
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
      <h1>Wheres the home page at?</h1>
      <Link to={`/search`}>Seach tab?</Link>
    </div>
  )
}

export default Home
