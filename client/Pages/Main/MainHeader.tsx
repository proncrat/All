import { Link } from 'react-router'

import { useSession, signOut } from '@/lib/auth'

import { Search } from 'lucide-react'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'

import { IoMdSettings } from 'react-icons/io'
import { Button } from '@/components/ui/button'

export function THEHEADER() {
  const { data: session } = useSession()
  return (
    <header className="THEHEADER mb-5 flex justify-between p-2 items border-b-2">
      <Link to={'/'}>BEANVID</Link>
      <form className="flex gap-3" action="/search">
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
