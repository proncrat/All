import { useMessages } from '@/client/hooks'
import { Link, useParams } from 'react-router'
import { Sendbox } from './SENDBOX'

export function Messagebox() {
  const { id } = useParams()

  const { data, isPending, isError, error, isSuccess } = useMessages(id)

  //console.log(data)

  if (isPending) {
    return <p>beans</p>
  }

  return (
    <div className="w-[90%] h-[94vh]">
      <div className="h-[95%] p-5 flex flex-col-reverse gap-8 overflow-auto scrollbar hover:scrollbar-thumb-zinc-400 hover:scrollbar-track-[lab(2.75381% 0 0)]">
        {data.map((message, index) => (
          <div key={index} className="flex gap-4">
            <img
              className="rounded-full w-12 aspect-square h-12"
              alt="some pfp"
              src={message.pfp}
            />
            <div>
              <div className="flex gap-4 items-center">
                <Link to={'/profile/' + message.senderid}>
                  <p>{message.name}</p>
                </Link>
                <p className="text-xs text-zinc-400">
                  {new Date(message.date).toLocaleString()}
                </p>
              </div>
              {message.type == 'text' && <p>{message.text}</p>}
              {message.type == 'img' && (
                <img className="max-w-200" alt="idk vro" src={message.text} />
              )}
            </div>
          </div>
        ))}
      </div>
      <div>
        <Sendbox />
      </div>
    </div>
  )
}
