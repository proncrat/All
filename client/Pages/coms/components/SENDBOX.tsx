import { useSendMessage } from '@/client/hooks/usemessages'
import { InputGroup, InputGroupInput } from '@/components/ui/input-group'
import { useState } from 'react'
import { useParams } from 'react-router'
import { Spinner } from '../../Util/Spinner'
import { FaFileUpload } from 'react-icons/fa'
import { Preview } from './ImgPreview'

export function Sendbox() {
  const baseUpload = {
    active: false,
    filename: '',
    filetype: '',
    data: '',
    previewUrl: '',
  }

  const [fileUpload, setFileUpload] = useState(baseUpload)

  function imgHandler(e) {
    const value = URL.createObjectURL(e.target.files[0])
    setFileUpload({
      ...fileUpload,
      ['previewUrl']: value,
      ['data']: e.target.files[0],
      ['filename']: e.target.files[0].name,
      active: true,
    })
  }

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
      {fileUpload.active && (
        <Preview file={fileUpload} callback={setFileUpload} />
      )}
      <div className="flex gap-3 ">
        <label
          htmlFor="hiddenFileInput"
          className="bg-gray-700 w-8 aspect-square rounded flex justify-center items-center cursor-pointer"
        >
          <FaFileUpload size={'20px'} />
        </label>
        <input
          onChange={imgHandler}
          type="file"
          id="hiddenFileInput"
          style={{ display: 'none' }}
        />
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
