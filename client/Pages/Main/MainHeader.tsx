import { Link } from 'react-router'

import { useSession, signOut } from '@/lib/auth'

import { Search } from 'lucide-react'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from '@/components/ui/input-group'

import { IoMdSettings } from 'react-icons/io'
import { Button } from '@/components/ui/button'

export function THEHEADER() {
  const { data: session, isPending } = useSession()
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
        <form className="flex" action="/search">
          <InputGroup>
            <InputGroupInput
              spellCheck="false"
              type="text"
              autoComplete="off"
              name="query"
              placeholder="Search..."
            />
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
          </InputGroup>
          <button>SEARCH</button>
        </form>
      </div>
      <div className="flex">
        <Button variant="outline" size="icon" aria-label="Submit">
          <IoMdSettings></IoMdSettings>
        </Button>
        {session ? (
          <div className="flex gap-2">
            <p>{session.user.username}</p>
            <button onClick={() => signOut()}>Logout</button>
          </div>
        ) : (
          <Link to={'signin'}>LOGIN</Link>
        )}
      </div>
    </header>
  )
}
