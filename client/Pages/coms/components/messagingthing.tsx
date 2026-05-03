import { InputGroup, InputGroupInput } from '@/components/ui/input-group'

export function Messagebox() {
  const messages = [
    {
      chatid: 1,
      senderid: 2,
      recieverid: 1,
      sender: 'Jean',
      pfp: 'https://dk2dv4ezy246u.cloudfront.net/widgets/sSoFDYe3ZbPQ_large.jpg',
      date: '21/04/2026 10:16 pm',
      type: 'text',
      text: 'Bro what are you even on about cuh',
    },
    {
      sender: 'Goth',
      pfp: 'https://i.pinimg.com/736x/fd/c9/5e/fdc95e24e075e75d99aea0f188152454.jpg',
      date: '21/04/2026 10:17 pm',
      type: 'text',
      text: 'Why am i here',
    },
    {
      sender: 'GOD',
      pfp: 'http://localhost:3000/images/janedoe2.jpg',
      date: '21/04/2026 10:17 pm',
      type: 'text',
      text: 'Lowkey the fault of some external force wallahi',
    },
    {
      sender: 'Jean',
      pfp: 'https://dk2dv4ezy246u.cloudfront.net/widgets/sSoFDYe3ZbPQ_large.jpg',
      date: '21/04/2026 10:16 pm',
      type: 'text',
      text: 'Bro what are you even on about cuh',
    },
    {
      sender: 'GOD',
      pfp: 'http://localhost:3000/images/janedoe2.jpg',
      date: '21/04/2026 10:17 pm',
      type: 'text',
      text: 'Lowkey the fault of some external force wallahi',
    },
    {
      sender: 'Jean',
      pfp: 'https://dk2dv4ezy246u.cloudfront.net/widgets/sSoFDYe3ZbPQ_large.jpg',
      date: '21/04/2026 10:16 pm',
      type: 'img',
      text: 'http://localhost:3000/images/grace.jpg',
    },
    {
      sender: 'GOD',
      pfp: 'http://localhost:3000/images/janedoe2.jpg',
      date: '21/04/2026 10:17 pm',
      type: 'text',
      text: 'Lowkey the fault of some external force wallahi',
    },
  ]

  return (
    <div className="w-[90%] h-[94vh]">
      <div className="h-[95%] p-5 flex flex-col-reverse gap-8 overflow-auto scrollbar hover:scrollbar-thumb-zinc-400 hover:scrollbar-track-[lab(2.75381% 0 0)]">
        {messages.map((message, index) => (
          <div key={index} className="flex gap-4">
            <img
              className="rounded-full w-12 aspect-square h-12"
              alt="some pfp"
              src={message.pfp}
            />
            <div>
              <div className="flex gap-4 items-center">
                <p>{message.sender}</p>
                <p className="text-xs text-zinc-400">{message.date}</p>
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
        <InputGroup>
          <InputGroupInput
            spellCheck="false"
            type="text"
            autoComplete="off"
            name={'name'}
          />
        </InputGroup>
      </div>
    </div>
  )
}
