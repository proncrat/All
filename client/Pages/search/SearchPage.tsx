//import { useParams } from 'react-router'
import { Link } from 'react-router'
import { useProfileAll } from '../../hooks'
import { profile } from '@/client/models/profile'

function Search() {
  //const { id } = useParams()

  const { data, isPending, isError, isSuccess } = useProfileAll()

  return (
    <div className=" max-w-7xl m-auto">
      {isPending && <div>Loading...</div>}
      {isError && <div>Something went wrong</div>}
      {isSuccess &&
        data.map((profile: profile) => (
          <div key={profile.id} className="border mb-4">
            <Link to={`/profile/${profile.id}`}>
              <div className="flex gap-6">
                <img
                  className="object-cover aspect-square"
                  alt="A THUMBNAIL"
                  src={profile.pfp}
                />
                <div className="mt-2">
                  <p>{profile.name}</p>
                  <div className="flex gap-2">
                    <p>@{profile.id}</p>
                    <p>&middot;</p>
                    <p>{profile.followers}</p>
                  </div>
                  <p>{profile.description}</p>
                </div>
              </div>
            </Link>
          </div>
        ))}
    </div>
  )
}

export default Search
