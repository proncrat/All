import { Usesessionid } from '@/client/hooks'
import { useSendMessage } from '@/client/hooks/usemessages'
import { InputGroup, InputGroupInput } from '@/components/ui/input-group'
import { useSession } from '@/lib/auth'
import { useState } from 'react'
import { useParams } from 'react-router'
import { Spinner } from '../../Util/Spinner'
import { FaFileUpload } from 'react-icons/fa'

export function Sendbox() {
  const [text, setText] = useState('')
  const { id } = useParams()
  const sendmessage = useSendMessage()

  const [mutationstate, statecontrol] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()

    const data = {
      chatid: id,
      senderid: null,
      type: 'text',
      text: e.target.text.value,
      send_date: null,
    }

    try {
      statecontrol('pending')
      await sendmessage.mutateAsync(data)
      statecontrol('success')
      setText('')
    } catch (error) {
      statecontrol('error')
      console.error('Mutation failed:', error)
    }
  }

  function handler(e) {
    setText(e.target.value)
  }

  return (
    <form className="p-2" onSubmit={handleSubmit}>
      <div className="flex gap-3 ">
        <div className="bg-gray-700 w-8 aspect-square rounded flex justify-center items-center">
          <FaFileUpload size={'20px'} />
        </div>
        <InputGroup className="w-full">
          {mutationstate == 'pending' && (
            <div className="w-3">
              <Spinner />
            </div>
          )}

          <InputGroupInput
            value={text}
            onChange={handler}
            spellCheck="false"
            type="text"
            autoComplete="off"
            name={'text'}
          />
        </InputGroup>
      </div>
    </form>
  )
}
