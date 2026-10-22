import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router'

import { IoMdSettings } from 'react-icons/io'
import { RxAvatar } from 'react-icons/rx'
import { FiLogOut } from 'react-icons/fi'

import { useSession, signOut } from '@/lib/auth'

// small footer links, edit routes/labels here
const FOOTER_LINKS = [
  { to: '/privacy', label: 'Privacy Policy' },
  { to: '/terms', label: 'Terms of Service' },
  { to: '/help', label: 'Help Center' },
  { to: '/about', label: 'About' },
]

export function Headerpfp() {
  const { data: session, isPending } = useSession()
  const location = useLocation()

  const [isOpen, setIsOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  // close on click/tap outside, and on Escape
  useEffect(() => {
    if (!isOpen) return

    const onPointerDown = (e: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }

    // capture phase so it still fires if something else stops propagation
    document.addEventListener('pointerdown', onPointerDown, true)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [isOpen])

  // close when navigating
  useEffect(() => {
    setIsOpen(false)
  }, [location])

  if (isPending) {
    return <div className="size-8 animate-pulse rounded-full bg-zinc-800" />
  }

  const user = session?.user
  const displayName = user?.name || user?.username
  const handle = user?.username

  return (
    <div ref={wrapRef} className="relative flex items-center gap-2">
      {/* logged out: login link sits next to the menu button */}
      {!session && (
        <Link
          to="/signin"
          className="rounded-lg border border-zinc-600 px-3 py-1 text-sm transition-colors hover:border-zinc-300 hover:bg-white/5"
        >
          LOGIN
        </Link>
      )}

      <button
        onClick={() => setIsOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={session ? 'Account menu' : 'Menu'}
        className={`block cursor-pointer rounded-full ring-2 transition-shadow focus-visible:ring-white ${
          isOpen ? 'ring-white/70' : 'ring-transparent hover:ring-white/30'
        }`}
      >
        {user ? (
          <img
            alt=""
            className="aspect-square w-8 rounded-full object-cover"
            src={user.image ?? '/images/stock.jpg'}
          />
        ) : (
          <RxAvatar className="size-8" />
        )}
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-64 origin-top-right overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900/95 shadow-2xl backdrop-blur"
        >
          {user && (
            <div className="flex items-center gap-3 p-4">
              <img
                alt=""
                className="aspect-square w-12 shrink-0 rounded-full object-cover"
                src={user.image ?? '/images/stock.jpg'}
              />
              <div className="min-w-0">
                <p className="truncate font-medium">{displayName}</p>
                {handle && (
                  <p className="truncate text-sm text-zinc-400">@{handle}</p>
                )}
              </div>
            </div>
          )}

          <div className={`p-1.5 ${user ? 'border-t border-zinc-800' : ''}`}>
            <Link
              to="/settings"
              role="menuitem"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-white/10 focus-visible:bg-white/10 focus-visible:outline-none"
            >
              <IoMdSettings size={18} className="text-zinc-400" />
              Settings
            </Link>
            {user && (
              <button
                role="menuitem"
                onClick={() => signOut()}
                className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-red-500/10 hover:text-red-400 focus-visible:bg-red-500/10 focus-visible:outline-none"
              >
                <FiLogOut size={18} className="text-zinc-400" />
                Log out
              </button>
            )}
          </div>

          <nav
            aria-label="Legal and help"
            className="flex flex-wrap gap-x-3 gap-y-1 border-t border-zinc-800 px-4 py-3 text-xs text-zinc-500"
          >
            {FOOTER_LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="transition-colors hover:text-zinc-300 hover:underline focus-visible:text-zinc-300 focus-visible:underline focus-visible:outline-none"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  )
}
