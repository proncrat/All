import { LuMessagesSquare } from 'react-icons/lu'

export function SideBar() {
  return (
    <div
      className="fixed top-[50.2px] left-0 border-r-2"
      style={{
        width: '60px',
        height: '100vh',
        backgroundColor: 'black',
      }}
    >
      <div className="flex justify-center pt-4">
        <LuMessagesSquare size={'30px'} />
      </div>
    </div>
  )
}
