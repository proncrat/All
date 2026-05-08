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

export function PostPage() {
  //const { id } = useParams()

  const [searchoption, setsearchoption] = useState('Photo')

  const rootURL = new URL(`/api/v1`, document.baseURI)

  function clickhandler(e) {
    setsearchoption(e.target.textContent)
  }

  return (
    <div>
      <div className="w-full h-12 border-b-2 flex gap-1 pl-4 pt-2 pb-2 overflow-y-hidden">
        <Headerbutton
          click={clickhandler}
          activething={searchoption}
          text={'Photo'}
        />
      </div>
      <div className=" max-w-7xl m-auto p-4">
        <form
          action={rootURL + '/imgupload'}
          method="POST"
          encType="multipart/form-data"
        >
          <input type="file" name="image" />
          <button type="submit">Upload</button>
        </form>
      </div>
    </div>
  )
}
