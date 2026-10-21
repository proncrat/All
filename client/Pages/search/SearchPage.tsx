//import { useParams } from 'react-router'
import { Link } from 'react-router'
import { useProfileAll } from '../../hooks'
import { profile } from '@/client/models/profile'
import { useState } from 'react'

interface sublinks {
  text: string
  activething: string
  click: (e: React.MouseEvent<HTMLElement>) => void
}

function Headerbutton({ text, activething, click }: sublinks) {
  let classes =
    'pl-2 pr-2 rounded-sm cursor-pointer hover:text-[#8d8d8d] border-2-transparent [&.active]:border-2 '

  if (text == activething) {
    classes += 'active'
  }

  return (
    <button onClick={click} className={classes}>
      {text}
    </button>
  )
}

function Search() {
  //const { id } = useParams()

  const [searchoption, setsearchoption] = useState('Everything')

  const { data, isPending, isError, isSuccess } = useProfileAll()

  function clickhandler(e: React.MouseEvent<HTMLElement>) {
    setsearchoption(e.currentTarget.textContent)
  }

  return (
    <div className="h-full">
      <div className="w-full h-12 border-b border-zinc-800 flex gap-1 pl-4 pt-2 pb-2 overflow-y-hidden">
        <Headerbutton
          click={clickhandler}
          activething={searchoption}
          text={'Everything'}
        />
        <Headerbutton
          click={clickhandler}
          activething={searchoption}
          text={'Profiles'}
        />
        <Headerbutton
          click={clickhandler}
          activething={searchoption}
          text={'Videos'}
        />
        <Headerbutton
          click={clickhandler}
          activething={searchoption}
          text={'Posts'}
        />
        <Headerbutton
          click={clickhandler}
          activething={searchoption}
          text={'Songs'}
        />
        <Headerbutton
          click={clickhandler}
          activething={searchoption}
          text={'Photos'}
        />
        <Headerbutton
          click={clickhandler}
          activething={searchoption}
          text={'Playlists'}
        />
      </div>
      <div className=" max-w-7xl m-auto p-4">
        {isPending && <div>Loading...</div>}
        {isError && <div>Something went wrong</div>}

        {data == null && <div>Something went wrong</div>}

        {isSuccess &&
          data.map((profile: profile) => (
            <Link
              key={profile.id}
              className=" mb-4 group flex border border-zinc-800 rounded-xl p-2 shadow-[0px_0px_8px_0px_#ffffff17] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white active:bg-position-[100%_30%] hover:bg-position-[100%_50%] bg-linear-to-br [&.active]:bg-position-[100%_70%]  from-black from-60% to-slate-600 bg-size-[200%_200%] bg-position-[100%_0%] transition-all"
              to={`/profile/${profile.id}`}
            >
              <div className="flex gap-6">
                <img
                  className="rounded-xl aspect-square w-30"
                  alt="A THUMBNAIL"
                  src={profile.pfp}
                />
                <div className="mt-2">
                  <p className="truncate text-base font-semibold text-white">
                    {profile.name}
                  </p>
                  <div className="flex gap-3">
                    <p className="truncate text-sm text-neutral-400">
                      @{profile.id}
                    </p>
                    <p className="text-sm text-neutral-500">
                      {profile.followers} follower
                    </p>
                    <p className="text-sm text-neutral-500">
                      {profile.following} following
                    </p>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-neutral-300">
                    {profile.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
      </div>
    </div>
  )
}

export default Search
