//import { useParams } from 'react-router'
import { Link } from 'react-router'
import { useProfileAll } from '../../hooks'
import { profile } from '@/client/models/profile'
import { useState } from 'react'

function Headerbutton({ text, activething, click }) {
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

  function clickhandler(e) {
    setsearchoption(e.target.textContent)
  }

  return (
    <div>
      <div className="w-full h-12 border-b-2 flex gap-1 pl-4 pt-2 pb-2 overflow-y-hidden">
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

        {isSuccess &&
          data.map((profile: profile) => (
            <div key={profile.id} className="border mb-4 rounded-xl p-2">
              <Link to={`/profile/${profile.id}`}>
                <div className="flex gap-6">
                  <img
                    className="rounded-xl aspect-square w-30"
                    alt="A THUMBNAIL"
                    src={profile.pfp}
                  />
                  <div className="mt-2">
                    <p>{profile.name}</p>
                    <div className="flex gap-2">
                      <p>@{profile.id}</p>
                      <p>&middot;</p>
                      <p>{profile.followers}</p>
                    </div>
                    <p>{profile.description}</p>
                  </div>
                </div>
              </Link>
            </div>
          ))}
      </div>
    </div>
  )
}

export default Search
