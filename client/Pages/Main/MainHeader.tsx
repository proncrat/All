import { Link } from 'react-router'

import { useSession, signOut } from '@/lib/auth'

import { CiCirclePlus } from 'react-icons/ci'

import { Search } from 'lucide-react'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'

import { IoMdSettings } from 'react-icons/io'

export function THEHEADER() {
  const { data: session } = useSession()
  return (
    <header
      style={{ backgroundColor: 'lab(3 0 0 / 0.91)' }}
      className="THEHEADER mb-5 flex justify-between p-2 items border-b-2 fixed top-0 w-full z-30"
    >
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
        <Link to={'/post'}>
          <CiCirclePlus size={'32'} />
        </Link>
        <Link to={'/settings'} className="mr-4">
          <IoMdSettings size={'32'} />
        </Link>
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
