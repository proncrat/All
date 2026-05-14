import { Link } from 'react-router'

import { useSession, signOut } from '@/lib/auth'

import { Search } from 'lucide-react'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'

import { IoMdSettings } from 'react-icons/io'

import { IoSearch } from 'react-icons/io5'

import { RxHamburgerMenu } from 'react-icons/rx'
import { Usesessionid, useUserData } from '@/client/hooks'
import { useRef } from 'react'

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
        {session ? (
          <div className="flex gap-2">
            {!isPending && (
              <button onClick={profclick} className="cursor-pointer">
                <img
                  alt="a pfp"
                  className="rounded-full aspect-square w-8"
                  src={userdata.pfp}
                />
              </button>
            )}
          </div>
        ) : (
          <div className="flex gap-2">
            <button onClick={profclick} className="cursor-pointer">
              <img
                alt="a pfp"
                className="rounded-full aspect-square w-8"
                src="/images/stock.jpg"
              />
            </button>
          </div>
        )}
      </div>
      <div
        ref={profiledrop}
        className="hidden bg-tpbackground border absolute w-50 h-50 top-15 right-3 rounded-xl"
      >
        {session && <p>{session.user.username}</p>}

        {session ? (
          <button className="cursor-pointer" onClick={() => signOut()}>
            Logout
          </button>
        ) : (
          <Link to={'signin'}>LOGIN</Link>
        )}

        <Link
          to={'/settings'}
          className={'p-2 rounded-sm w-full overflow-hidden'}
        >
          <div className="flex items-center gap-5">
            <IoMdSettings className="shrink-0" size={'30px'} />
            <p className="text-lg">Settings</p>
          </div>
        </Link>
      </div>
    </header>
  )
}
