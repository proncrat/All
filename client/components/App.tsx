import { StrictMode } from 'react'
import { Outlet } from 'react-router'
import ProfileHeader from './ProfileHeader'
import ProfileTopSection from './ProfileTopSection'

function App() {
  return (
    <StrictMode>
      <div>
        <ProfileTopSection name="Bob"></ProfileTopSection>
        <ProfileHeader></ProfileHeader>
        <Outlet />
      </div>
    </StrictMode>
  )
}

export default App
