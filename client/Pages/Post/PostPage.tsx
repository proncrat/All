import { useState } from 'react'
import { PhotoUpload } from './components/Photo'

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

export function PostPage() {
  //const { id } = useParams()

  const [searchoption, setsearchoption] = useState('Photo')

  function clickhandler(e) {
    setsearchoption(e.target.textContent)
  }

  return (
    <div>
      <div className="w-full h-12 border-b-2 flex gap-1 pl-4 pt-2 pb-2 overflow-y-hidden">
        <Headerbutton
          click={clickhandler}
          activething={searchoption}
          text={'Video'}
        />
        <Headerbutton
          click={clickhandler}
          activething={searchoption}
          text={'Post'}
        />
        <Headerbutton
          click={clickhandler}
          activething={searchoption}
          text={'Song'}
        />
        <Headerbutton
          click={clickhandler}
          activething={searchoption}
          text={'Photo'}
        />
      </div>
      <div className=" max-w-7xl m-auto p-4">
        <PhotoUpload />
      </div>
    </div>
  )
}
