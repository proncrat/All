import { NavLink, Outlet } from 'react-router'

export function Coms() {
  const userId = 1

  const lelist = [
    {
      chatid: 1,
      memberids: [1, 2],
      name: 'Jean',
      pfp: 'https://dk2dv4ezy246u.cloudfront.net/widgets/sSoFDYe3ZbPQ_large.jpg',
      linkids: [1, 2],
    },
    {
      chatid: 2,
      memberids: [1, 3],
      name: 'Goth',
      pfp: 'https://i.pinimg.com/736x/fd/c9/5e/fdc95e24e075e75d99aea0f188152454.jpg',
      linkids: [1, 2],
    },
  ]

  return (
    <div className="flex h-full">
      <div
        style={{ width: '250px', height: '94vh' }}
        className=" border-r-2 p-4 gap-4 flex flex-col overflow-auto scrollbar hover:scrollbar-thin hover:scrollbar-thumb-zinc-400 hover:scrollbar-track-[lab(2.75381% 0 0)]"
      >
        {lelist.map((person, index) => (
          <NavLink
            className={'[&.active]:bg-mist-800 rounded-lg hover:bg-mist-800'}
            to={'/coms/' + person.chatid}
            key={index}
          >
            <div className="flex items-center gap-4  rounded-lg cursor-pointer ">
              <img
                className="rounded-full w-12 aspect-square"
                alt="some pfp"
                src={person.pfp}
              />
              <p className="text-lg">{person.name}</p>
            </div>
          </NavLink>
        ))}
      </div>
      <Outlet />
    </div>
  )
}
