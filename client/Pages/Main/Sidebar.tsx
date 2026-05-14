import { LuMessagesSquare } from 'react-icons/lu'
import { NavLink, useNavigate } from 'react-router'
import { Miniplayer } from './Miniplayer'
import { IoAlbumsOutline } from 'react-icons/io5'
import { IoInformationCircleOutline } from 'react-icons/io5'

export function SideBar({ width }) {
  const navigate = useNavigate()

  return (
    <div
      className=" bg-tpbackground fixed top-[50.2px] left-0 border-r-2 transition-all"
      style={{
        width: `${width}px`,
        height: '100vh',
      }}
    >
      <div className="flex flex-col items-baseline p-2 justify-center gap-3 overflow-auto">
        <Miniplayer width={width} />

        <NavLink
          to={'/coms'}
          className={
            '[&.active]:bg-mist-800 p-2 rounded-sm w-full overflow-hidden'
          }
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
        <NavLink
          to={'/comss'}
          className={
            '[&.active]:bg-mist-800 p-2 rounded-sm w-full overflow-hidden'
          }
        >
          <div className="flex items-center gap-5">
            <IoAlbumsOutline
              className="shrink-0"
              onClick={() => navigate('/coms')}
              size={'30px'}
            />
            <p className="text-lg">Library</p>
          </div>
        </NavLink>
        <NavLink
          to={'/Info'}
          className={
            '[&.active]:bg-mist-800 p-2 rounded-sm w-full overflow-hidden'
          }
        >
          <div className="flex items-center gap-5">
            <IoInformationCircleOutline
              className="shrink-0"
              onClick={() => navigate('/coms')}
              size={'30px'}
            />
            <p className="text-lg">Information</p>
          </div>
        </NavLink>
      </div>
    </div>
  )
}
