//import { useParams } from 'react-router'
import { Link } from 'react-router'

function Home() {
  return (
    <div>
      <div className="w-full h-10 border-b-2"></div>
      <h1>Wheres the home page at?</h1>
      <Link to={`/search`}>Seach tab?</Link>
    </div>
  )
}

export default Home
