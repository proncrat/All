//import { useParams } from 'react-router'
import { Link } from 'react-router'

function Home() {
  return (
    <div>
      <div className="w-full h-10 border-b border-zinc-800"></div>
      <div className="p-10">
        <h1>Wheres the home page at?</h1>
        <Link to={`/search`}>Seach tab?</Link>
      </div>
    </div>
  )
}

export default Home
