import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router'
import { useLocation } from 'react-router'

//Icons
import { IoMdSettings } from 'react-icons/io'
import { RxAvatar } from 'react-icons/rx'

import { useSession, signOut } from '@/lib/auth'

export function Headerpfp() {
  const { data: session, isPending: seshpend } = useSession()

  //test data

  const data = {
    pfp: '/images/stock.jpg',
    loggedIN: !!session,
    userId: 'idk',
  }

  //hide when click otherplaces
  const location = useLocation()

  const [isOpen, setIsOpen] = useState(false)
  const divRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (divRef.current && !divRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    setIsOpen(false)
  }, [location])
  if (seshpend) {
    return <p>Thinking</p>
  }

  return (
    <div ref={divRef} className="flex">
      <button onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {data.loggedIN ? (
          <img
            alt="a pfp"
            className="rounded-full aspect-square w-8"
            src={data.pfp}
          />
        ) : (
          <div className="flex items-center gap-2 border rounded-lg pl-1 pr-2 box-border w-25">
            <RxAvatar size={'100%'} className="w-8" />
            <Link to={'signin'}>LOGIN</Link>
          </div>
        )}
      </button>
      {isOpen && (
        <div className="bg-tpbackground border absolute w-50 h-50 top-15 right-3 rounded-xl p-3">
          {data.loggedIN && (
            <div className="flex gap-3">
              <img
                alt="a pfp"
                className="rounded-full aspect-square w-12"
                src={data.pfp}
              />
              <div>
                <p>{session.user.username}</p>
                <p>@{data.userId}</p>
              </div>
            </div>
          )}
          {data.loggedIN && (
            <button
              className="cursor-pointer hover:text-gray-400"
              onClick={() => signOut()}
            >
              Logout
            </button>
          )}
          <Link to={'/settings'}>
            <div className="flex items-center gap-4">
              <IoMdSettings size={'30px'} />
              <p className="text-lg">Settings</p>
            </div>
          </Link>
        </div>
      )}
    </div>
  )
}
