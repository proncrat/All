import { IoPlaySkipForward } from 'react-icons/io5'
import { IoPlaySkipBackSharp } from 'react-icons/io5'
import { IoPlaySharp } from 'react-icons/io5'
import { IoPauseSharp } from 'react-icons/io5'
import { Link } from 'react-router'
import { IoVolumeHighSharp } from 'react-icons/io5'
import { IoShuffle } from 'react-icons/io5'

import { useEffect, useRef, useState } from 'react'

export function Miniplayer({ width }) {
  const audioRef = useRef(null)
  const track = useRef(null)
  const detailref = useRef(null)
  const imgref = useRef(null)
  const trackall = useRef(null)
  const miniplayer = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)

  console.log(width)

  useEffect(() => {
    if (width == '60') {
      detailref.current.style.display = 'none'
      imgref.current.style.display = 'none'
      trackall.current.style.display = 'none'
      miniplayer.current.classList.remove('bg-mist-800')
      miniplayer.current.classList.remove('p-2')
    } else if (width == '300') {
      miniplayer.current.classList.add('bg-mist-800')
      miniplayer.current.classList.add('p-2')
      detailref.current.style.display = 'block'
      imgref.current.style.display = 'block'
      trackall.current.style.display = 'block'
    }
  }, [width])

  function beans() {
    if (width == '60') {
      detailref.current.style.display = 'none'
    } else if (width == '300') {
      detailref.current.style.display = 'block'
    }
  }

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  function trackHandler() {
    console.log(
      (audioRef.current.currentTime / audioRef.current.duration) * 100,
    )
    track.current.style.width =
      (audioRef.current.currentTime / audioRef.current.duration) * 100 + '%'
  }

  return (
    <div ref={miniplayer} className=" rounded-sm w-full overflow-hidden">
      <audio
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onTimeUpdate={trackHandler}
        ref={audioRef}
        src="/audio/shessonice.m4a"
      />
      <div ref={detailref}>
        <img
          className="rounded-sm mb-2"
          src="/images/b51d4a51-5c16-4e8c-99ff-a957fadb02c3.png"
          alt="thumbnail?"
        ></img>
      </div>
      <div>
        <div className="flex flex-col justify-center items-center">
          <div ref={imgref} className="rounded-sm mb-2">
            <Link to={'/'}>
              <p>She&apos;s so nice</p>
            </Link>
          </div>
          <div
            ref={trackall}
            className="w-full h-2 bg-gray-400 rounded-sm overflow-hidden"
          >
            <div
              ref={track}
              className=" transition-all h-full rounded-sm bg-white "
            />
          </div>
          <div className="flex gap-3 items-center ">
            <button className="cursor-pointer p-2 text-gray-400 hover:text-white">
              <IoShuffle size={'20px'} />
            </button>
            <button className="cursor-pointer p-2 text-gray-400 hover:text-white">
              <IoPlaySkipBackSharp size={'20px'} />
            </button>
            <button
              onClick={togglePlay}
              className="cursor-pointer p-2 text-gray-400 hover:text-white"
            >
              {!isPlaying ? (
                <IoPlaySharp size={'25px'} />
              ) : (
                <IoPauseSharp size={'25px'} />
              )}
            </button>
            <button className="cursor-pointer p-2 text-gray-400 hover:text-white">
              <IoPlaySkipForward size={'20px'} />
            </button>
            <button className="cursor-pointer p-2 text-gray-400 hover:text-white">
              <IoVolumeHighSharp size={'20px'} />
            </button>

            <div className="w-4 hidden">
              <input
                id="default-range"
                type="range"
                value="50"
                className="w-full h-2 bg-neutral-quaternary rounded-full appearance-none cursor-pointer"
              ></input>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
