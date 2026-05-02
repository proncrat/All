import { LuMessagesSquare } from 'react-icons/lu'
import { useNavigate } from 'react-router'

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
      <div className="flex flex-col justify-center pt-4 items-center gap-3">
        <LuMessagesSquare onClick={() => navigate('/coms')} size={'30px'} />
      </div>
    </div>
  )
}
