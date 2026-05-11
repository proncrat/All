import { LuMessagesSquare } from 'react-icons/lu'
import { NavLink, useNavigate } from 'react-router'
import { FaPlayCircle } from 'react-icons/fa'
import { Miniplayer } from './Miniplayer'

export function SideBar({ width }) {
  const navigate = useNavigate()

  return (
    <div
      className="fixed top-[50.2px] left-0 border-r-2 transition-all"
      style={{
        width: `${width}px`,
        height: '100vh',
        backgroundColor: 'lab(3 0 0 / 0.91)',
      }}
    >
      <div className="flex flex-col items-baseline p-2 justify-center gap-3 overflow-auto">
        <Miniplayer width={width} />

        <NavLink
          to={'/coms'}
          className={'[&.active]:bg-mist-800 p-2 rounded-sm w-full'}
        >
          <div className="flex items-center gap-5">
            <LuMessagesSquare
              className="shrink-0"
              onClick={() => navigate('/coms')}
              size={'30px'}
            />
            <p className="text-lg">Comunication</p>
          </div>
        </NavLink>
      </div>
    </div>
  )
}
