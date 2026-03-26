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
      <NavLink
        end
        to={props.link}
        className={({ isActive, isPending }) =>
          isPending ? 'pending' : isActive ? 'active' : ''
        }
      >
        {props.text}
      </NavLink>
    </div>
  )
}

function ProfileHeader() {
  const { id } = useParams()
  console.log(id)
  return (
    <div>
      <hr></hr>
      <div style={{ display: 'flex', gap: '10px' }}>
        <SubHeaderLink link={'profile/' + id} text="Home"></SubHeaderLink>
        <SubHeaderLink link={'videos'} text="Videos"></SubHeaderLink>
        <SubHeaderLink link={'posts'} text="Posts"></SubHeaderLink>
        <SubHeaderLink link={'Live'} text="Livestreams"></SubHeaderLink>
        <SubHeaderLink link={'Song'} text="Songs"></SubHeaderLink>
        <SubHeaderLink link={'Playlist'} text="Playlists"></SubHeaderLink>
        <SubHeaderLink link={'picture'} text="Photos"></SubHeaderLink>
        <SubHeaderLink link={'about'} text="About"></SubHeaderLink>
        <SubHeaderLink link={'call'} text="Call"></SubHeaderLink>
      </div>
      <hr></hr>
    </div>
  )
}

export default ProfileHeader
