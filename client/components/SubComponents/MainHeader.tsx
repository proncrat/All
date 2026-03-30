import { Link, NavLink } from 'react-router'

export function THEHEADER() {
  return (
    <header className="THEHEADER">
      <div className="flex">
        <p style={{ margin: '0' }}>menu goes here</p>
        <Link to={'/'}>BEANVID</Link>
      </div>
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
      <div className="flex">
        <p style={{ margin: '0' }}>SETTINGS goes here</p>
        <button>LOGIN(make work)</button>
      </div>
    </header>
  )
}
