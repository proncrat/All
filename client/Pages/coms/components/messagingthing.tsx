import { useMessages } from '@/client/hooks'
import { useParams } from 'react-router'
import { Sendbox } from './SENDBOX'
import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { ShownMessage } from './messages'
import { FaPhone } from 'react-icons/fa6'

//import WebRTCCall from './claude'

export function Messagebox() {
  const { id } = useParams()
  const queryClient = useQueryClient()

  const [mutationstate, setmessageload] = useState(false)

  const { data, isPending, isError, error, isSuccess } = useMessages(id)

  useEffect(() => {
    const eventSource = new EventSource('http://localhost:3000/api/v1/test')

    // Handle incoming messages
    eventSource.onmessage = (event) => {
      console.log(event.data)
      new Notification('GOD', {
        body: 'Bro what',
        icon: 'http://localhost:5173/images/janedoe2.jpg',
      })
      queryClient.invalidateQueries({ queryKey: ['messages', id] })
    }

    // Cleanup: This function runs when the component unmounts
    return () => {
      eventSource.close()
      console.log('SSE Connection Closed')
    }
  }, [])

  if (isPending) {
    return <p>beans</p>
  }

  return (
    <div className="flex flex-col h-full">
      {/*<WebRTCCall />*/}
      <div className="w-full h-10 border-b-2">
        <button
          onClick={() => startCall(peer, data[id - 1].peer_id)}
          className="cursor-pointer"
        >
          <FaPhone className="hover:fill-gray-500" size={'25px'} />
        </button>
      </div>
      <div className="h-full">
        <div className=" min-h-[80vh] max-h-[87vh] h-full w-full p-5 flex flex-col-reverse gap-8 overflow-auto scrollbar hover:scrollbar-thumb-zinc-400 hover:scrollbar-track-[lab(2.75381% 0 0)]">
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
