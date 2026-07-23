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

function App() {
  const queryClient = new QueryClient()
  //State fo sidebar
  const [width, setWidth] = useState(60)

  const handlewidth = () => {
    setWidth(width === 60 ? 300 : 60)
  }

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
    const myClientId = session?.user.id

    console.log(myClientId)

    // Pass the identifier as a query parameter when opening the SSE connection
    const eventSource = new EventSource(
      `http://localhost:3000/api/v1/test/events?clientId=${myClientId}`,
    )

    // Listen for incoming messages targeting this client
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type == 'notification') {
        console.log('Received targeted message:', data)
        new Notification(data.user, {
          body: data.text,
          icon: data.icon,
        })
      }
    }

    // Handle connection errors
    eventSource.onerror = (err) => {
      console.error('SSE Connection failed:', err)
    }
  }, [seshpend, session])
*/
  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <CookiesProvider>
          <Toaster />
          <div className="w-full h-screen">
            <THEHEADER sidebar={handlewidth} />
            <SideBar width={width} />
            <CallingStuffs />
            <div
              style={{ marginLeft: `${width}px` }}
              className=" transition-all pt-12 h-full"
            >
              <Outlet />
            </div>
          </div>
        </CookiesProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </StrictMode>
  )
}

export default App
