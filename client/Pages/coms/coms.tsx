import { InputGroup, InputGroupInput } from '@/components/ui/input-group'

export function Coms() {
  const lelist = [
    {
      name: 'GOD',
      pfp: 'http://localhost:3000/images/janedoe2.jpg',
    },
    {
      name: 'Jean',
      pfp: 'https://dk2dv4ezy246u.cloudfront.net/widgets/sSoFDYe3ZbPQ_large.jpg',
    },
  ]

  const messages = [
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
      date: '21/04/2026 10:16 pm',
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
      date: '21/04/2026 10:16 pm',
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
      date: '21/04/2026 10:16 pm',
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
      date: '21/04/2026 10:16 pm',
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
      date: '21/04/2026 10:16 pm',
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
      date: '21/04/2026 10:16 pm',
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
      date: '21/04/2026 10:16 pm',
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
      date: '21/04/2026 10:16 pm',
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
      date: '21/04/2026 10:16 pm',
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
      date: '21/04/2026 10:16 pm',
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
      date: '21/04/2026 10:16 pm',
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
      date: '21/04/2026 10:16 pm',
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
      date: '21/04/2026 10:16 pm',
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
      date: '21/04/2026 10:16 pm',
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
      date: '21/04/2026 10:16 pm',
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
      date: '21/04/2026 10:16 pm',
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
      date: '21/04/2026 10:16 pm',
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
      date: '21/04/2026 10:16 pm',
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
      date: '21/04/2026 10:16 pm',
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
      date: '21/04/2026 10:16 pm',
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
      date: '21/04/2026 10:16 pm',
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
      date: '21/04/2026 10:16 pm',
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
      date: '21/04/2026 10:16 pm',
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
      date: '21/04/2026 10:16 pm',
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
      date: '21/04/2026 10:16 pm',
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
      date: '21/04/2026 10:16 pm',
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
      date: '21/04/2026 10:16 pm',
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
      date: '21/04/2026 10:16 pm',
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
      date: '21/04/2026 10:16 pm',
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
      date: '21/04/2026 10:16 pm',
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
      date: '21/04/2026 10:16 pm',
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
      date: '21/04/2026 10:16 pm',
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
      date: '21/04/2026 10:16 pm',
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
      date: '21/04/2026 10:16 pm',
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
      date: '21/04/2026 10:16 pm',
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
      date: '21/04/2026 10:16 pm',
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
      date: '21/04/2026 10:16 pm',
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
      date: '21/04/2026 10:16 pm',
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
      date: '21/04/2026 10:16 pm',
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
      date: '21/04/2026 10:16 pm',
      type: 'text',
      text: 'Lowkey the fault of some external force wallahi',
    },
  ]

  return (
    <div className="flex h-full">
      <div
        style={{ width: '250px', height: '94vh' }}
        className=" border-r-2 p-4 gap-4 flex flex-col overflow-auto scrollbar hover:scrollbar-thumb-taupe-700 hover:scrollbar-track-[lab(2.75381% 0 0)]"
      >
        {lelist.map((person, index) => (
          <div
            key={index}
            className="flex items-center gap-4 hover:bg-mist-800 rounded-lg cursor-pointer "
          >
            <img
              className="rounded-full w-12 aspect-square"
              alt="some pfp"
              src={person.pfp}
            />
            <p className="text-lg">{person.name}</p>
          </div>
        ))}
      </div>
      <div className="w-[90%] h-[94vh]">
        <div className="h-[95%] p-5 flex flex-col gap-8 overflow-auto scrollbar hover:scrollbar-thumb-taupe-700 hover:scrollbar-track-[lab(2.75381% 0 0)]">
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
                <p>{message.text}</p>
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
    </div>
  )
}
