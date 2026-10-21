import { StrictMode, useEffect, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { CookiesProvider } from 'react-cookie'

import { THEHEADER } from '../Main/MainHeader'
import { Outlet } from 'react-router'
import { Toaster } from '@/components/ui/sonner'
import { SideBar } from '../Main/Sidebar'
import { useSession } from '@/lib/auth'
import { CallingStuffs } from './Calls'
import { NthParentContext } from './call/Context'
import { MiniPlayer } from './Miniplayer'
import { PlayerProvider, usePlayer } from '../Main/PlayerContext' // <-- added usePlayer

function Layout() {
  // State for sidebar
  const [width, setWidth] = useState(60)
  const { playRequest } = usePlayer()

  const handlewidth = () => {
    setWidth(width === 60 ? 300 : 60)
  }

  // open the sidebar whenever a song is started
  useEffect(() => {
    if (playRequest > 0) setWidth(300)
  }, [playRequest])

  const [data, setData] = useState('')

  const handleChildAction = (childData) => {
    setData(childData)
  }

  return (
    <NthParentContext.Provider value={{ handleChildAction }}>
      <div className="w-full h-screen">
        <THEHEADER sidebar={handlewidth} />
        <SideBar width={width} />
        <CallingStuffs callrequest={data} callcleanup={setData} />
        <div
          style={{ '--sidebar-width': `${width}px` } as React.CSSProperties}
          className="
            transition-all pt-12 h-full
            ml-0 pb-20
            md:ml-[var(--sidebar-width)] md:pb-0
          "
        >
          <Outlet />
        </div>
      </div>
    </NthParentContext.Provider>
  )
}

function App() {
  const queryClient = new QueryClient()

  //document.documentElement.classList.add('dark')

  useEffect(() => {
    const theme = localStorage.getItem('theme')

    if (theme == 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])
  /*
  const { data: session, isPending: seshpend } = useSession()

  useEffect(() => {
    ...your commented-out SSE code...
  }, [seshpend, session])
*/

  return (
    <PlayerProvider>
      <QueryClientProvider client={queryClient}>
        <CookiesProvider>
          <Toaster />
          <Layout />
        </CookiesProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </PlayerProvider>
  )
}

export default App
