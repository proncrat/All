import { useMessages } from '@/client/hooks'
import { useParams } from 'react-router'
import { Sendbox } from './SENDBOX'
import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { ShownMessage } from './messages'
import { FaPhone } from 'react-icons/fa6'
import { Call } from './call'

//import WebRTCCall from './claude'

export function Messagebox() {
  const { id } = useParams()
  const queryClient = useQueryClient()

  const [mutationstate, setmessageload] = useState(false)

  const { data, isPending, isError, error, isSuccess } = useMessages(id)

  //THIS DOESENT WORK CORRECTLY FIX ONE DAY PLZ
  useEffect(() => {
    const eventSource = new EventSource('http://localhost:3000/api/v1/test')

    // Handle incoming messages
    eventSource.onmessage = (event) => {
      console.log(event.data)
      queryClient.invalidateQueries({ queryKey: ['messages', id] })
      setTimeout(() => {
        console.log(data.at(0))
        new Notification('GOD', {
          body: data.at(0).text,
          icon: data.at(0).pfp,
        })
      }, 1000)
    }

    // Cleanup: This function runs when the component unmounts
    return () => {
      eventSource.close()
      console.log('SSE Connection Closed')
    }
  }, [])

  const [callStatus, setcallStatus] = useState(false)

  if (isPending) {
    return <p>beans</p>
  }

  return (
    <div className="flex flex-col h-full">
      {callStatus && <Call />}
      <div className=" h-12 border-b-2">
        <button onClick={() => setcallStatus(true)} className="cursor-pointer">
          <FaPhone className="hover:fill-gray-500" size={'25px'} />
        </button>
      </div>
      <div className="flex-1 h-0">
        <div className=" h-full p-5 flex flex-col-reverse gap-8 overflow-auto scrollbar hover:scrollbar-thumb-zinc-400 hover:scrollbar-track-[lab(2.75381% 0 0)]">
          {data.map((message, index) => (
            <ShownMessage key={index} data={message} />
          ))}
        </div>
      </div>
      <div className="h-12">
        <Sendbox statecontrol={setmessageload} />
      </div>
    </div>
  )
}
