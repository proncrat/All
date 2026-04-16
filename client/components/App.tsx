import { StrictMode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import { THEHEADER } from './SubComponents/MainHeader'
import { Outlet } from 'react-router'
import { Toaster } from '@/components/ui/sonner'

function App() {
  const queryClient = new QueryClient()
  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <Toaster />
        <THEHEADER />
        <Outlet />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </StrictMode>
  )
}

export default App
