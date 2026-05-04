import { Usesessionid } from '@/client/hooks'
import { useSendMessage } from '@/client/hooks/usemessages'
import { InputGroup, InputGroupInput } from '@/components/ui/input-group'
import { useSession } from '@/lib/auth'
import { useState } from 'react'
import { useParams } from 'react-router'

export function Sendbox() {
  const [text, setText] = useState('')
  const { id } = useParams()
  const sendmessage = useSendMessage()

  const { data: lesesh, isPending: seshpend } = useSession()

  const userseshid = lesesh?.session.userId

  const { data: idcheck, isPending: idpend } = Usesessionid(
    userseshid,
    !seshpend,
  )

  const handleSubmit = async (e) => {
    e.preventDefault()

    const data = {
      chatid: id,
      senderid: idcheck.id,
      type: 'text',
      text: e.target.text.value,
      send_date: new Date(),
    }

    await sendmessage.mutateAsync(data)
    setText('')
  }

  function handler(e) {
    setText(e.target.value)
  }

  return (
    <form onSubmit={handleSubmit}>
      <InputGroup>
        <InputGroupInput
          value={text}
          onChange={handler}
          spellCheck="false"
          type="text"
          autoComplete="off"
          name={'text'}
        />
      </InputGroup>
    </form>
  )
}
