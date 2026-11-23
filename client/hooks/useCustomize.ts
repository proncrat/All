import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateProfile } from '../apis/customizeapi'
import { authClient } from '@/lib/auth'

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: async () => {
      // Profile pages are fetched under 'profileAll'
      queryClient.invalidateQueries({ queryKey: ['profileAll'] })
      // The server syncs pfp -> better-auth user.image; refresh the session
      // so the header avatar etc. pick it up (bypass the cookie cache)
      await authClient.getSession({ query: { disableCookieCache: true } })
      authClient.$store.notify('$sessionSignal')
    },
  })
}
