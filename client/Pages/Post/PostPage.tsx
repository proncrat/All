import { useState } from 'react'
import { PhotoUpload } from './components/Photo'
import { VideoUpload } from './components/VideoUpload'
import { SongUpload } from './components/SongUpload'
import { SignInNotice } from './components/uploadui'
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
      {searchoption == 'Video' && (
        <div className=" max-w-7xl m-auto p-4">
          {user ? (
            <VideoUpload />
          ) : (
            !isPending && <SignInNotice what="videos" />
          )}
        </div>
      )}
      {searchoption == 'Song' && (
        <div className=" max-w-7xl m-auto p-4">
          {user ? (
            <SongUpload
              defaultArtist={
                (user as { username?: string }).username ?? user.name
              }
            />
          ) : (
            !isPending && <SignInNotice what="songs" />
          )}
        </div>
      )}
      {searchoption == 'Photo' && (
        <div className=" max-w-7xl m-auto p-4">
          <PhotoUpload />
        </div>
      )}
      {searchoption == 'Post' && (
        <div className=" max-w-7xl m-auto p-4">
          {user ? (
            <NewPost
              user={{
                name: (user as { username?: string }).username ?? user.name,
                avatar: user.image,
              }}
            />
          ) : (
            !isPending && <SignInNotice what="posts" />
          )}
        </div>
      )}
    </div>
  )
}
