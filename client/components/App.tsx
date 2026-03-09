import { StrictMode } from 'react'
import { Outlet } from 'react-router'
import ProfileHeader from './ProfileHeader'
import ProfileTopSection from './ProfileTopSection'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

function App() {
  const data = { name: 'Bob' }

  const queryClient = new QueryClient()

  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <div style={{ width: '1100px', margin: 'auto' }}>
          <ProfileTopSection name="Bob"></ProfileTopSection>
          <ProfileHeader></ProfileHeader>
          {/*Much wow send props to all outlets so cool*/}
          <Outlet context={data} />
        </div>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </StrictMode>
  )
}

export default App
