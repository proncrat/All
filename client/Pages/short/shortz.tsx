import { FaVolumeUp } from 'react-icons/fa'
import { FaVolumeMute } from 'react-icons/fa'

import { BiLike } from 'react-icons/bi'
import { BiDislike } from 'react-icons/bi'

import { useRef, useState, useEffect } from 'react'

export function Shortz({
  src = 'video/short1.mp4',
  poster = '',
  loop = true,
  muted = false,
}) {
  const videoRef = useRef(null)
  const track = useRef(null)
  const trackthingy = useRef(null)

  function trackHandler() {
    track.current.style.width =
      (videoRef.current.currentTime / videoRef.current.duration) * 100 + '%'

    trackHandlerforthingy()
  }

  const hideTimeout = useRef(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [showOverlay, setShowOverlay] = useState(false)
  const [animKey, setAnimKey] = useState(0) // forces re-trigger of the pop animation

  const flashIcon = (playing) => {
    setIsPlaying(playing)
    setShowOverlay(true)
    setAnimKey((k) => k + 1)

    clearTimeout(hideTimeout.current)
    hideTimeout.current = setTimeout(() => setShowOverlay(false), 600)
  }

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (video.paused) {
      video.play()
      flashIcon(true)
    } else {
      video.pause()
      flashIcon(false)
    }
  }

  function trackHandlerforthingy() {
    trackthingy.current.style.left =
      (videoRef.current.currentTime / videoRef.current.duration) * 100 + '%'
  }

  useEffect(() => {
    return () => clearTimeout(hideTimeout.current)
  }, [])

  return (
    <div className="w-full h-full p-2 flex justify-center">
      <div style={styles.player} onClick={togglePlay} className="relative">
        <div className=" group w-full bg-black/40 h-1 bottom-0 rounded-sm overflow-hidden absolute">
          <div
            ref={track}
            className="h-full bg-slate-800 w-0 transition-all rounded-sm"
          />
          <div
            ref={trackthingy}
            className="group-hover:w-2 group-hover:h-2 bg-white absolute top-0"
          />
        </div>

        <video
          onTimeUpdate={trackHandler}
          ref={videoRef}
          src={src}
          poster={poster}
          loop={loop}
          muted={muted}
          playsInline
          className="h-full rounded-sm"
        />

        <div
          key={animKey}
          style={{
            ...styles.overlay,
            opacity: showOverlay ? 1 : 0,
            animation: showOverlay ? 'vpp-pop 0.4s ease' : 'none',
          }}
        >
          {isPlaying ? <PlayIcon /> : <PauseIcon />}
        </div>

        <style>{`
          @keyframes vpp-pop {
            0%   { transform: translate(-50%, -50%) scale(0.7); opacity: 0; }
            40%  { transform: translate(-50%, -50%) scale(1.08); opacity: 1; }
            100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          }
        `}</style>
      </div>
    </div>

    /*
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
    */
  )
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" style={styles.icon}>
      <path fill="#fff" d="M8 5v14l11-7z" />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" style={styles.icon}>
      <path fill="#fff" d="M6 5h4v14H6zM14 5h4v14h-4z" />
    </svg>
  )
}

const styles = {
  player: {
    //position: 'relative',
    height: '100%',
    background: '#000',
    borderRadius: 12,
    overflow: 'hidden',
    cursor: 'pointer',
  },
  overlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 72,
    height: 72,
    borderRadius: '50%',
    background: 'rgba(0, 0, 0, 0.55)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
    transition: 'opacity 0.35s ease',
  },
  icon: {
    width: 34,
    height: 34,
  },
}
