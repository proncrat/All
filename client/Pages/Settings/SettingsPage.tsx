import { Outlet } from 'react-router'
import { NavLink } from 'react-router'

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

export function SettingsPage() {
  return (
    <div className="max-w-375 m-auto pt-2">
      <div className="m-7 ">
        <div className="flex gap-30">
          <div className="flex flex-col">
            <h2 className="text-3xl mb-5">Settings</h2>
            <SubHeaderLink link={'/settings'} text="Debug"></SubHeaderLink>
            <SubHeaderLink link={'customize'} text="Customize"></SubHeaderLink>
            <SubHeaderLink
              link={'authsett'}
              text="Auth testing"
            ></SubHeaderLink>
            <SubHeaderLink link={'theme'} text="Theme"></SubHeaderLink>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
