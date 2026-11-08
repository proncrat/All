import { useState } from 'react'
import { PhotoUpload } from './components/Photo'
import Headerbutton from '../Util/Headerbutton'
import NewPost from './components/Post'
import { useSession } from '@/lib/auth'

export function PostPage() {
  //const { id } = useParams()

  const { data: session, isPending } = useSession()
  const user = session?.user

  const [searchoption, setsearchoption] = useState('Photo')

  function clickhandler(e) {
    setsearchoption(e.target.textContent)
  }

  const options = ['Video', 'Post', 'Song', 'Photo']

  return (
    <div>
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
      {searchoption == 'Photo' && (
        <div className=" max-w-7xl m-auto p-4">
          <PhotoUpload />
        </div>
      )}
      {searchoption == 'Post' && (
        <div className=" max-w-7xl m-auto p-4">
          <NewPost user={{ name: user.username, avatar: user.image }} />
        </div>
      )}
    </div>
  )
}
