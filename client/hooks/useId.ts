import { useSession } from '@/lib/auth'
import { Usesessionid } from '../hooks'

export function useFetchId() {
  let userseshid = ''

  let loading = true

  const { data: session, isPending: pending1, error: problem1 } = useSession()

  if (session?.session.userId) {
    userseshid = session?.session.userId
  }

  const { data: data2, isPending: pending2 } = Usesessionid(
    userseshid,
    !pending1,
  )

  const userId = data2?.id

  const data = { userid: userId }

  if (pending1 == false && pending2 == false) {
    loading = false
  }

  return { data, loading: loading, error: problem1 }
}
