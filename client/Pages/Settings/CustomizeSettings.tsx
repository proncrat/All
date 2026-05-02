import { Usesessionid, useUserData } from '@/client/hooks'
import { InputGroup, InputGroupInput } from '@/components/ui/input-group'
import { useSession } from '@/lib/auth'
import { useState } from 'react'
import { CustomizeForm } from './components/CustomizeForm'

export function SettingsCustomize() {
  const { data: lesesh, isPending: seshpend } = useSession()

  const userseshid = lesesh?.session.userId

  const { data: idcheck, isPending: idpend } = Usesessionid(
    userseshid,
    !seshpend,
  )

  const userId = idcheck?.id

  const {
    data: userdata,
    isPending,
    isSuccess,
  } = useUserData(userId, undefined, !idpend)

  console.log(userdata)

  if (lesesh == null) {
    return <p>Log in you chud</p>
  }

  if (isPending) {
    return <p>Loads</p>
  }

  if (isSuccess) {
    return <CustomizeForm initialdata={userdata} />
  }
}
