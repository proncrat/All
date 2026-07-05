import { StrictMode, useEffect, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { CookiesProvider } from 'react-cookie'

import { THEHEADER } from '../Main/MainHeader'
import { Outlet } from 'react-router'
import { Toaster } from '@/components/ui/sonner'
import { SideBar } from '../Main/Sidebar'

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

  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <CookiesProvider>
          <Toaster />
          <div className="w-full h-screen">
            <THEHEADER sidebar={handlewidth} />
            <SideBar width={width} />
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
