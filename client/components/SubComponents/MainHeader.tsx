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
      <div className="flex">
        <form action="/search">
          <input
            placeholder="search"
            spellCheck="false"
            type="text"
            autoComplete="off"
            name="query"
          ></input>
        </form>
        <button>SEARCH</button>
      </div>

      <button>LOGIN</button>
    </header>
  )
}
