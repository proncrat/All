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

import { useEffect, useState, type RefObject } from 'react'

function useHideOnScroll(
  headerRef: RefObject<HTMLElement | null>,
  threshold = 8,
) {
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    let lastY = window.scrollY
    let ticking = false

    const update = () => {
      const y = window.scrollY
      const headerHeight = headerRef.current?.offsetHeight ?? 60

      // ignore iOS rubber-band overscroll
      if (y < 0) {
        ticking = false
        return
      }

      if (Math.abs(y - lastY) > threshold) {
        setHidden(y > lastY && y > headerHeight)
        lastY = y
      }
      ticking = false
    }

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update)
        ticking = true
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [headerRef, threshold])

  return hidden
}

export function THEHEADER({ sidebar }) {
  const headerRef = useRef<HTMLElement>(null)
  const hidden = useHideOnScroll(headerRef)

  function searchHandler(e) {
    e.preventDefault() // was e.preventdefault() (typo, would throw)
  }

  const profiledrop = useRef(null)

  return (
    <header
      ref={headerRef}
      className={`backdrop-blur-md bg-black/30 mb-5 flex justify-between p-2 items-center border-b border-zinc-800 fixed top-0 w-full z-30
        transition-transform duration-300 will-change-transform
        ${hidden ? 'max-md:-translate-y-full' : 'translate-y-0'}`}
    >
      <div className="flex gap-4 items-center">
        <div className="md:block hidden">
          <RxHamburgerMenu
            className="cursor-pointer"
            onClick={sidebar}
            size={'30px'}
          />
        </div>
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
