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
  const isActive = text === activething

  return (
    <button
      onClick={click}
      className={`px-2 py-1 rounded-sm cursor-pointer border-2 transition-colors
        [-webkit-tap-highlight-color:transparent] focus:outline-none
        ${
          isActive ? 'border-white' : 'border-transparent hover:text-[#8d8d8d]'
        }`}
    >
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

  const options = [
    'Everything',
    'Profiles',
    'Videos',
    'Posts',
    'Songs',
    'Photos',
    'Playlists',
  ]

  return (
    <div className="h-full">
      <div
        className="w-full border-b border-zinc-800 flex gap-2 px-4 py-2
    overflow-x-auto overflow-y-hidden whitespace-nowrap
    [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
    snap-x snap-proximity overscroll-x-contain"
      >
        {options.map((text) => (
          <div key={text} className="shrink-0 snap-start">
            <Headerbutton
              click={clickhandler}
              activething={searchoption}
              text={text}
            />
          </div>
        ))}
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
