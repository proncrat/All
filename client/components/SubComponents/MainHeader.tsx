import { Link, NavLink } from 'react-router'

export function THEHEADER() {
  return (
    <header className="THEHEADER">
      <Link to={'/'}>BEANVID</Link>
      {/*<NavLink
        to={'/comms'}
        className={({ isActive, isPending }) =>
          isPending ? 'pending' : isActive ? 'active' : ''
        }
      >
        Communication
      </NavLink>*/}
      <button>LOGIN</button>
    </header>
  )
}
