import { LuMessagesSquare } from 'react-icons/lu'
import { NavLink } from 'react-router'
import { Miniplayer } from './Miniplayer'
import {
  IoAlbumsOutline,
  IoInformationCircleOutline,
  IoAddCircleOutline,
  IoMusicalNotesOutline,
} from 'react-icons/io5'
import { useState } from 'react'

const links = [
  { to: '/coms', label: 'Comunication', Icon: LuMessagesSquare },
  { to: '/comss', label: 'Library', Icon: IoAlbumsOutline },
  { to: '/post', label: 'Post', Icon: IoAddCircleOutline },
  //{ to: '/Info', label: 'Information', Icon: IoInformationCircleOutline },
]

export function SideBar({ width }) {
  const [playerOpen, setPlayerOpen] = useState(false)

  return (
    <div
      className="
        backdrop-blur-md bg-black/30 fixed z-50 transition-all
        bottom-0 left-0 right-0 w-full h-auto border-t border-zinc-800
        pb-[env(safe-area-inset-bottom)]
        md:pb-0 md:top-[49px] md:bottom-auto md:right-auto md:h-screen md:border-t-0 md:border-r
        md:w-[var(--sidebar-width)] md:flex md:flex-col
      "
      style={{ '--sidebar-width': `${width}px` } as React.CSSProperties}
    >
      {/* Miniplayer panel:
          phone  -> floats above the bar, toggled by the button
          desktop -> normal block at the top of the sidebar, always visible.
          It's hidden with CSS (not unmounted) so music keeps playing when closed. */}
      <div
        className={`
          ${playerOpen ? 'block' : 'hidden'}
          absolute bottom-full left-0 right-0 p-2 bg-zinc-950/90 border-t border-zinc-800
          md:block md:static md:p-2 md:pb-0 md:bg-transparent md:border-t-0
        `}
      >
        <Miniplayer width={width} />
      </div>

      <div className="flex flex-row md:flex-col items-center md:items-baseline justify-around md:justify-center p-2 gap-3 overflow-auto">
        {links.map(({ to, label, Icon }, i) => (
          <NavLink
            key={i}
            to={to}
            className="[&.active]:bg-mist-800 p-2 rounded-sm md:w-full overflow-hidden"
          >
            <div className="flex flex-col md:flex-row items-center gap-1 md:gap-5">
              <Icon className="shrink-0" size={30} />
              <p className="text-[10px] md:text-lg">{label}</p>
            </div>
          </NavLink>
        ))}

        {/* Phone-only toggle button */}
        <button
          type="button"
          onClick={() => setPlayerOpen((o) => !o)}
          aria-expanded={playerOpen}
          aria-label="Toggle music player"
          className={`md:hidden p-2 rounded-sm overflow-hidden ${
            playerOpen ? 'bg-mist-800' : ''
          }`}
        >
          <div className="flex flex-col items-center gap-1">
            <IoMusicalNotesOutline className="shrink-0" size={30} />
            <p className="text-[10px]">Player</p>
          </div>
        </button>
      </div>
    </div>
  )
}
