import { useUserData } from '@/client/hooks'
import { useEffect } from 'react'
import { useParams } from 'react-router'
import Viewer from 'viewerjs'

export function Photos() {
  const { id } = useParams()
  const { data, isPending, isError, error, isSuccess } = useUserData(
    id,
    'photos',
  )

  useEffect(() => {
    if (isSuccess === true && data.length > 0) {
      //doesent update gallery on refetches only on reloads
      const gallery = new Viewer(document.getElementById('images'))
      gallery.update()
    }
  }, [data, isSuccess])

  if (isPending) {
    return <div>Loading...</div>
  }

  if (isError) {
    return <div>Error: {error.message}</div>
  }

  console.log(data)

  if (data.length == 0) {
    return 'True adam error (No photos)'
  }

  return (
    <div>
      <ul id="images">
        {data.map((item) => (
          <li key={item.id}>
            <img
              data-original={item.url}
              alt={item.describe}
              src={item.thumburl}
            />
          </li>
        ))}
        <li></li>
      </ul>
    </div>
  )
}
