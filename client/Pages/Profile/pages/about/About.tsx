import { useUserData } from '@/client/hooks'
import { Link, useParams } from 'react-router'
import { ProfileComments } from './Comments'

export function About() {
  const { id } = useParams()

  const { data, isPending, isError, error, isSuccess } = useUserData(
    id,
    'description',
  )

  if (isPending) {
    return <div>Loading...</div>
  }

  if (isError) {
    return <div>Error: {error.message}</div>
  }

  if (isSuccess) {
    return (
      <div>
        <h2 className="text-2xl mb-2">Describe</h2>
        {data.description ? (
          <p className="mb-8">{data.description}</p>
        ) : (
          <p className="mb-8">Bro make a description.</p>
        )}

        {data.links && (
          <div className="mb-8">
            <h2 className="text-2xl mb-2">Links</h2>
            {JSON.parse(data.links).map((item, index) => (
              <div key={index}>
                <Link
                  to={`https://${item.link}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {item.name}
                </Link>
              </div>
            ))}
          </div>
        )}

        <ProfileComments />
      </div>
    )
  }
}
