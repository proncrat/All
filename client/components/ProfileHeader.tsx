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
        <SubHeaderLink
          link={'profile/' + id + '/videos'}
          text="Videos"
        ></SubHeaderLink>
        <SubHeaderLink
          link={'profile/' + id + '/posts'}
          text="Posts"
        ></SubHeaderLink>
        <SubHeaderLink
          link={'profile/' + id + '/Live'}
          text="Livestreams"
        ></SubHeaderLink>
        <SubHeaderLink
          link={'profile/' + id + '/Song'}
          text="Songs"
        ></SubHeaderLink>
        <SubHeaderLink
          link={'profile/' + id + '/Playlist'}
          text="Playlists"
        ></SubHeaderLink>
        <SubHeaderLink
          link={'profile/' + id + '/picture'}
          text="Photos"
        ></SubHeaderLink>
        <SubHeaderLink
          link={'profile/' + id + '/about'}
          text="About"
        ></SubHeaderLink>
        <SubHeaderLink
          link={'profile/' + id + '/call'}
          text="Call"
        ></SubHeaderLink>
      </div>
      <hr></hr>
    </div>
  )
}

export default ProfileHeader
