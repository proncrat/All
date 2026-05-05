import { StrictMode, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

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

  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <Toaster />
        <THEHEADER sidebar={handlewidth} />
        <div>
          <SideBar width={width} />
          <div
            style={{ marginLeft: `${width}px` }}
            className="mt-[50.2px] transition-all"
          >
            <Outlet />
          </div>
        </div>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </StrictMode>
  )
}

export default App
