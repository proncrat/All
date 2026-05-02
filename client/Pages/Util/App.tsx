import { StrictMode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import { THEHEADER } from '../Main/MainHeader'
import { Outlet } from 'react-router'
import { Toaster } from '@/components/ui/sonner'
import { SideBar } from '../Main/Sidebar'

function App() {
  const queryClient = new QueryClient()
  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <Toaster />
        <THEHEADER />
        <div>
          <SideBar />
          <div className="mt-20 ml-[60px]">
            <Outlet />
          </div>
        </div>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </StrictMode>
  )
}

export default App
