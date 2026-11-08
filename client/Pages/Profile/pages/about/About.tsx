import { useUserData } from '@/client/hooks'
import { Link, useParams } from 'react-router'
import { ProfileComments } from './Comments'
import { AiOutlineLoading } from 'react-icons/ai'
import { Spinner } from '@/client/Pages/Util/SpinnerBox'

export function About() {
  const { id } = useParams()

  const { data, isPending, isError, error, isSuccess } = useUserData(
    id,
    'description',
  )

  if (isPending) {
    return <Spinner />
  }

  if (isError) {
    return <div>Error: {error.message}</div>
  }

  if (isSuccess) {
    return (
      <div className="px-4 pt-3">
        <h2 className="text-2xl mb-2">Describe</h2>
        {data.description ? (
          <p className="mb-8">{data.description}</p>
        ) : (
          <p className="mb-8">Bro make a description.</p>
        )}

        {data.links && (
          <div className="mb-8">
            <h2 className="text-2xl mb-2">Links</h2>
            {data.links.map((item, index) => (
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
