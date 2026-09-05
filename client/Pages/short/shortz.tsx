import { FaVolumeUp } from 'react-icons/fa'
import { FaVolumeMute } from 'react-icons/fa'

import { BiLike } from 'react-icons/bi'
import { BiDislike } from 'react-icons/bi'

import { useRef, useState } from 'react'

import { CiPlay1 } from 'react-icons/ci'
import { CiPause1 } from 'react-icons/ci'

export function Shortz() {
  const track = useRef(null)
  const videoRef = useRef(null)
  const [isPlaying, setisPlaying] = useState(false)

  const handleParentClick = (e) => {
    // Only execute if the parent itself was clicked directly
    if (e.target === e.currentTarget) {
      togglePlay()
    }
  }

  const [playicon, setplayicon] = useState('opacity-0')
  const [pauseicon, setpauseicon] = useState('opacity-0')

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        showHiddeiconpause()
        videoRef.current.pause()
      } else {
        showHiddeiconplay()
        videoRef.current.play()
      }
      setisPlaying(!isPlaying)
    }
  }

  function showHiddeiconplay() {
    setplayicon('opacity-100')
    setTimeout(() => {
      setplayicon('opacity-0')
    }, 500)
  }

  function showHiddeiconpause() {
    setpauseicon('opacity-100')
    setTimeout(() => {
      setpauseicon('opacity-0')
    }, 500)
  }

  function trackHandler() {
    /*console.log(
      (audioRef.current.currentTime / audioRef.current.duration) * 100,
    )*/
    track.current.style.width =
      (videoRef.current.currentTime / videoRef.current.duration) * 100 + '%'
  }

  return (
    <div className="w-full h-full p-2 flex justify-center">
      <div className="relative">
        <div
          onClick={handleParentClick}
          className="absolute w-full h-full rounded-sm flex justify-between flex-col"
        >
          <div>
            <button>
              <FaVolumeUp />
            </button>
            <button>
              <BiLike />
            </button>
            <button>
              <BiDislike />
            </button>
          </div>
          <div className="flex justify-center">
            <CiPlay1
              className={`bg-black/20 rounded-sm transition-all ${playicon}`}
              size={'45px'}
            />
            <CiPause1
              className={`bg-black/20 rounded-sm transition-all ${pauseicon}`}
              size={'45px'}
            />
          </div>
          <div className="w-full bg-black/40 h-1 bottom-0 rounded-sm overflow-hidden">
            <div
              ref={track}
              className="h-full bg-slate-800 w-0 transition-all rounded-sm"
            />
          </div>
        </div>
        <video
          onTimeUpdate={trackHandler}
          ref={videoRef}
          className="h-full rounded-sm"
        >
          <source src="video/short1.mp4" type="video/mp4" />
        </video>
      </div>
    </div>
  )
}
