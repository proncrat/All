import { StrictMode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import { THEHEADER } from './SubComponents/MainHeader'
import { Outlet } from 'react-router'

function App() {
  const queryClient = new QueryClient()
  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <THEHEADER />
        <Outlet />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </StrictMode>
  )
}

export default App
