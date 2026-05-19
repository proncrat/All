import { Link } from 'react-router'

import { useSession } from '@/lib/auth'

import { Search } from 'lucide-react'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'

import { IoSearch } from 'react-icons/io5'

import { RxHamburgerMenu } from 'react-icons/rx'
import { Usesessionid, useUserData } from '@/client/hooks'
import { useRef } from 'react'
import { Headerpfp } from './components/headerpfp'

export function THEHEADER({ sidebar }) {
  const { data: session, isPending: seshpend } = useSession()

  const userseshid = session?.session.userId

  const { data: idcheck, isPending: idpend } = Usesessionid(
    userseshid,
    !seshpend,
  )

  const userId = idcheck?.id

  const {
    data: userdata,
    isPending,
    isSuccess,
  } = useUserData(userId, undefined, !idpend)

  console.log(userdata)

  function searchHandler(e) {
    e.preventdefault()
  }

  const profiledrop = useRef(null)

  function profclick() {
    profiledrop.current.classList.toggle('hidden')
  }

  return (
    <header className="bg-tpbackground THEHEADER mb-5 flex justify-between p-2 items border-b-2 fixed top-0 w-full z-30">
      <div className="flex gap-4 items-center">
        <RxHamburgerMenu
          className="cursor-pointer"
          onClick={sidebar}
          size={'30px'}
        />
        <Link to={'/'}>BEANVID</Link>
      </div>
      <form onSubmit={searchHandler} className="flex gap-3">
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
        <button>
          <IoSearch />
        </button>
      </form>

      <div className="flex">
        <Headerpfp />
      </div>
    </header>
  )
}
