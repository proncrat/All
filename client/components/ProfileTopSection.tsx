import { useParams } from 'react-router'
import { useProfile, useUserData } from '../hooks'
import { useEffect } from 'react'

import Viewer from 'viewerjs'

function ProfileTopSection() {
  const { id } = useParams()
  const { data, isPending, isError, error, isSuccess } = useUserData(id)

  useEffect(() => {
    if (isSuccess === true) {
      //doesent update gallery on refetches only on reloads
      setTimeout(() => {
        const gallery = new Viewer(document.getElementById('imagesProfheader'))
        gallery.update()
      }, 500)
    }
  }, [data, isSuccess]) // Add 'data' and 'status' to the dependency array

  if (isPending) {
    return <div>Loading...</div>
  }
  if (isError) {
    return <div>Error: {error.message}</div>
  }

  return (
    <div id="imagesProfheader" className="flex">
      <img alt="pfp" src={data.pfp} />
      <div>
        <h2>{data.name}</h2>
        <p>{`${data.followers} Followers`}</p>
        <p>{`YAP - ${data.describe}`}</p>
      </div>
    </div>
  )
}
export default ProfileTopSection
