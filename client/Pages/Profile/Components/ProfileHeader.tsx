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
    <NavLink end to={props.link} className={'text-lg [&.active]:border-b-2'}>
      {props.text}
    </NavLink>
  )
}

import { Separator } from '@/components/ui/separator'

function ProfileHeader() {
  const { id } = useParams()

  return (
    <div>
      <div
        className="
      flex gap-3 mb-2
      overflow-x-auto whitespace-nowrap
      [&>*]:shrink-0
      [scrollbar-width:none] [-ms-overflow-style:none]
      [&::-webkit-scrollbar]:hidden
      snap-x
    "
      >
        <SubHeaderLink link={'/profile/' + id} text="Home" />
        <SubHeaderLink link={'videos'} text="Videos" />
        <SubHeaderLink link={'posts'} text="Posts" />
        <SubHeaderLink link={'Song'} text="Songs" />
        <SubHeaderLink link={'Playlist'} text="Playlists" />
        <SubHeaderLink link={'picture'} text="Photos" />
        <SubHeaderLink link={'about'} text="About" />
      </div>
      <Separator className="mb-2" />
    </div>
  )
}

export default ProfileHeader
