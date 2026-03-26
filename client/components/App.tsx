import { StrictMode } from 'react'
import { Outlet } from 'react-router'
import ProfileHeader from './ProfileHeader'
import ProfileTopSection from './ProfileTopSection'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { THEHEADER } from './SubComponents/MainHeader'
import Profilepage from './Profilepage'

function App() {
  const queryClient = new QueryClient()
  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <Profilepage></Profilepage>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </StrictMode>
  )
}

export default App
