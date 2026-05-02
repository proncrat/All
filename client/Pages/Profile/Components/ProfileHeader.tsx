import { NavLink, useParams } from 'react-router'
//import { useLocation } from 'react-router'
interface Sublink {
  link: string
  text: string
}

function SubHeaderLink(props: Sublink) {
  //const location = useLocation()
  //const currentPathname = location.pathname
  return (
    <div>
      <NavLink end to={props.link} className={'text-lg [&.active]:border-b-2'}>
        {props.text}
      </NavLink>
    </div>
  )
}

import { Separator } from '@/components/ui/separator'

function ProfileHeader() {
  const { id } = useParams()
  return (
    <div>
      <div className="flex gap-3 mb-2">
        <SubHeaderLink link={'/profile/' + id} text="Home"></SubHeaderLink>
        <SubHeaderLink link={'videos'} text="Videos"></SubHeaderLink>
        <SubHeaderLink link={'posts'} text="Posts"></SubHeaderLink>
        <SubHeaderLink link={'Song'} text="Songs"></SubHeaderLink>
        <SubHeaderLink link={'Playlist'} text="Playlists"></SubHeaderLink>
        <SubHeaderLink link={'picture'} text="Photos"></SubHeaderLink>
        <SubHeaderLink link={'about'} text="About"></SubHeaderLink>
      </div>
      <Separator className="mb-2" />
    </div>
  )
}

export default ProfileHeader
