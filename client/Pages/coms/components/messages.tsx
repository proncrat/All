import { Link } from 'react-router'

export function ShownMessage(data) {
  const message = data.data
  return (
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
          <img className="max-w-200 w-full" alt="idk vro" src={message.text} />
        )}
      </div>
    </div>
  )
}
