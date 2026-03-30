import { AuthUIProvider } from '@daveyplate/better-auth-ui'
import { authClient } from '../../server/lib/auth'
import { useNavigate, NavLink } from 'react-router'

export function Providers({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  return (
    <AuthUIProvider authClient={authClient} navigate={navigate} Link={NavLink}>
      {children}
    </AuthUIProvider>
  )
}
