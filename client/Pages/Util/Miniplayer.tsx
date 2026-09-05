import { IoPlaySkipForward } from 'react-icons/io5'
import { IoPlaySkipBackSharp } from 'react-icons/io5'
import { IoPlaySharp } from 'react-icons/io5'
import { IoPauseSharp } from 'react-icons/io5'
import { Link } from 'react-router'
import { IoVolumeHighSharp } from 'react-icons/io5'
import { IoShuffle } from 'react-icons/io5'

import { useEffect, useRef, useState } from 'react'

export function MiniPlayer({ width }) {
  const audioRef = useRef(null)
  const track = useRef(null)
  const detailref = useRef(null)
  const imgref = useRef(null)
  const trackall = useRef(null)
  const miniplayer = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volstate, setvolstate] = useState(false)

  const volbutt = useRef(null)

  useEffect(() => {
    miniplayer.current.classList.add('bg-mist-800')
    miniplayer.current.classList.add('p-2')
    detailref.current.style.display = 'block'
    imgref.current.style.display = 'block'
    trackall.current.style.display = 'block'
  }, [])

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
    /*console.log(
      (audioRef.current.currentTime / audioRef.current.duration) * 100,
    )*/
    track.current.style.width =
      (audioRef.current.currentTime / audioRef.current.duration) * 100 + '%'
  }

  function changevolume(e) {
    audioRef.current.volume = e.target.value / 100
  }

  function volhover(state) {
    setvolstate(state)
  }

  return (
    <div
      ref={miniplayer}
      className=" rounded-sm w-100 fixed bottom-0 right-0 z-100 flex gap-4"
    >
      <audio
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onTimeUpdate={trackHandler}
        ref={audioRef}
        src="/audio/song.mp3"
      />
      <div ref={detailref}>
        <img
          className="rounded-sm aspect-square w-16"
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
            className="w-full h-1 bg-[#6363633b] rounded-sm relative"
          >
            <div className="rounded-full bg-gray-400 w-3 h-3 absolute mx-auto "></div>
            <div
              ref={track}
              className=" transition-all h-full rounded-sm bg-white w-0 "
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
              className="cursor-pointer p-2 hover:text-gray-400"
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
            <div
              onMouseEnter={() => volhover(true)}
              onMouseLeave={() => volhover(false)}
              className="relative"
            >
              {volstate && (
                <div
                  ref={volbutt}
                  className="bg-[#ffffff4a] w-[100px] h-full rounded-sm absolute right-0 z-10"
                >
                  <input
                    id="default-range"
                    type="range"
                    className="w-full h-2 bg-neutral-quaternary rounded-full cursor-pointer"
                    onChange={changevolume}
                  ></input>
                </div>
              )}

              <button className="cursor-pointer p-2 text-gray-400 hover:text-white z-20 relative">
                <IoVolumeHighSharp size={'20px'} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
