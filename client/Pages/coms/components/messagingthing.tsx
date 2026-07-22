import { useMessages } from '@/client/hooks'
import { useParams } from 'react-router'
import { Sendbox } from './SENDBOX'
import { useState } from 'react'
import { ShownMessage } from './messages'
import { FaPhone } from 'react-icons/fa6'
import { Call } from './call'
import { useFetchId } from '@/client/hooks/useId'
import { Spinner } from '../../Util/Spinner'

//import WebRTCCall from './claude'

export function Messagebox() {
  const { id } = useParams()

  const [mutationstate, setmessageload] = useState(false)

  const { data, isPending, isError, error, isSuccess } = useMessages(id)

  const [callStatus, setcallStatus] = useState(false)

  const { data: leId, loading: leLoading, error: leError } = useFetchId()

  const userid = leId.userid

  if (isPending) {
    return <Spinner />
  }

  return (
    <div className="flex flex-col h-full relative">
      {callStatus && <Call callback={setcallStatus} />}
      <div className=" h-12 border-b-2">
        <button onClick={() => setcallStatus(true)} className="cursor-pointer">
          <FaPhone className="hover:fill-gray-500" size={'25px'} />
        </button>
      </div>
      <div className="flex-1 h-0">
        <div className=" h-full p-5 flex flex-col-reverse gap-8 overflow-auto scrollbar hover:scrollbar-thumb-zinc-400 hover:scrollbar-track-[lab(2.75381% 0 0)]">
          {data.map((message, index) => (
            <ShownMessage key={index} data={message} userId={userid} />
          ))}
        </div>
      </div>
      <div className="h-12">
        <Sendbox statecontrol={setmessageload} />
      </div>
    </div>
  )
}
