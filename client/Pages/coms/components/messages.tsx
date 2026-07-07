import { Link } from 'react-router'
import { IoEllipsisVerticalOutline } from 'react-icons/io5'
import { useState } from 'react'
import { useDeleteMessage } from '@/client/hooks/usemessages'

export function ShownMessage(data) {
  const [other, setother] = useState(false)

  const message = data.data

  function stateHandler() {
    if (other) {
      setother(false)
    } else {
      setother(true)
    }
  }

  const deleteMessage = useDeleteMessage()

  async function deleteMessageReq(data) {
    await deleteMessage.mutateAsync(data)
  }

  const temp = 1

  return (
    <div className="flex justify-between">
      <div className="flex gap-4">
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
            <img
              className="max-w-200 w-full"
              alt="idk vro"
              src={message.text}
            />
          )}
        </div>
      </div>
      {temp == message.senderid && (
        <div className="flex h-min">
          {other && (
            <div className="bg-amber-800 px-2 py-1 rounded-sm flex flex-col ">
              <button
                onClick={() => deleteMessageReq({ id: message.id })}
                className="cursor-pointer"
              >
                Delete
              </button>
              <button className="cursor-pointer">Edit</button>
            </div>
          )}
          <button
            onClick={stateHandler}
            className="hover:bg-mist-800 p-1 rounded-sm cursor-pointer"
          >
            <IoEllipsisVerticalOutline />
          </button>
        </div>
      )}
    </div>
  )
}
