import { Usesessionid, useUserData } from '@/client/hooks'
import { useSession } from '@/lib/auth'
import { CustomizeForm } from './components/CustomizeForm'

export function SettingsCustomize() {
  const { data: lesesh, isPending: seshpend } = useSession()

  const userseshid = lesesh?.session.userId

  const { data: idcheck } = Usesessionid(userseshid ?? '', !!userseshid)

  const userId = idcheck?.id

  const {
    data: userdata,
    isSuccess,
    isError,
  } = useUserData(userId, undefined, userId != null)

  if (seshpend) {
    return <p>Loads</p>
  }

  if (lesesh == null) {
    return <p>Log in you chud</p>
  }

  if (isError) {
    return <p>Couldn't load your profile</p>
  }

  if (!isSuccess) {
    return <p>Loads</p>
  }

  return <CustomizeForm initialdata={userdata} />
}
