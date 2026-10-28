import {
  IoPlaySkipForward,
  IoPlaySkipBackSharp,
  IoPlaySharp,
  IoPauseSharp,
  IoVolumeHighSharp,
  IoShuffle,
  IoClose,
} from 'react-icons/io5'
import { Link } from 'react-router'
import { useEffect, useRef, useState } from 'react'
import { usePlayer } from '../Main/PlayerContext'

export function MiniPlayer() {
  const {
    audioRef,
    current,
    playing, // song playing state
    toggle,
    next,
    prev,
    video,
    closeVideo,
  } = usePlayer()

  const videoRef = useRef<HTMLVideoElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [videoPlaying, setVideoPlaying] = useState(false)
  const [volOpen, setVolOpen] = useState(false)

  const mode: 'video' | 'song' | null = video
    ? 'video'
    : current
      ? 'song'
      : null
  const isPlaying = mode === 'video' ? videoPlaying : playing

  // the element whose progress / volume the controls act on
  const activeEl = () =>
    mode === 'video' ? videoRef.current : audioRef.current

  // stop the video element when the video is closed or replaced by a song
  useEffect(() => {
    if (!video) videoRef.current?.pause()
  }, [video])

  // progress bar follows whichever element is active
  useEffect(() => {
    const el = mode === 'video' ? videoRef.current : audioRef.current
    if (!el) return
    const update = () => {
      if (!trackRef.current || !el.duration) return
      trackRef.current.style.width = (el.currentTime / el.duration) * 100 + '%'
    }
    update()
    el.addEventListener('timeupdate', update)
    return () => el.removeEventListener('timeupdate', update)
  }, [mode, video?.id, current?.id])

  const togglePlay = () => {
    if (mode === 'video') {
      const v = videoRef.current
      if (!v) return
      if (v.paused) v.play().catch(() => {})
      else v.pause()
    } else {
      toggle() // your existing fade in/out
    }
  }

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = activeEl()
    if (!el || !el.duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    el.currentTime = ((e.clientX - rect.left) / rect.width) * el.duration
  }

  const changeVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const el = activeEl()
    if (el) el.volume = Number(e.target.value) / 100
  }

  const title = mode === 'video' ? video!.title : current?.title
  const href = mode === 'video' ? `/watch/${video!.id}` : '/'

  return (
    <div
      className={`rounded-sm fixed bottom-0 right-0 z-100 flex gap-4 bg-mist-800 p-2 ${
        mode ? '' : 'hidden'
      }`}
    >
      {/* thumbnail: video when a video is active, cover art for songs */}
      <div>
        <video
          ref={videoRef}
          src={video?.src}
          className={`rounded-sm w-40 aspect-video bg-black ${
            mode === 'video' ? '' : 'hidden'
          }`}
          onPlay={() => setVideoPlaying(true)}
          onPause={() => setVideoPlaying(false)}
          onLoadedMetadata={() => {
            const v = videoRef.current
            if (!v || !video) return
            v.currentTime = video.time
            v.play().catch(() => {})
          }}
          onEnded={closeVideo}
        />
        {mode === 'song' && (
          <img
            className="rounded-sm aspect-square w-16"
            src={current?.cover ?? '/images/placeholder.png'}
            alt={current?.title ?? 'cover'}
          />
        )}
      </div>

      <div className="w-56">
        <div className="flex flex-col justify-center items-center">
          {/* title (+ artist for songs) + close for videos */}
          <div className="flex w-full items-center justify-between mb-2 gap-2">
            <Link to={href} className="truncate" title={title}>
              <p className="truncate">{title ?? 'Nothing playing'}</p>
              {mode === 'song' && (
                <p className="truncate text-xs text-gray-400">
                  {current?.artist}
                </p>
              )}
            </Link>
            {mode === 'video' && (
              <button
                onClick={closeVideo}
                className="cursor-pointer text-gray-400 hover:text-white"
                aria-label="Close mini player"
              >
                <IoClose size={'20px'} />
              </button>
            )}
          </div>

          {/* progress bar (click to seek) */}
          <div
            onClick={seek}
            className="w-full h-1 bg-[#6363633b] rounded-sm relative cursor-pointer"
          >
            <div
              ref={trackRef}
              className="transition-all h-full rounded-sm bg-white w-0"
            />
          </div>

          {/* controls */}
          <div className="flex gap-3 items-center">
            <button className="cursor-pointer p-2 text-gray-400 hover:text-white">
              <IoShuffle size={'20px'} />
            </button>
            <button
              onClick={prev}
              disabled={mode === 'video'}
              className="cursor-pointer p-2 text-gray-400 hover:text-white disabled:opacity-30"
            >
              <IoPlaySkipBackSharp size={'20px'} />
            </button>
            <button
              onClick={togglePlay}
              className="cursor-pointer p-2 hover:text-gray-400"
            >
              {isPlaying ? (
                <IoPauseSharp size={'25px'} />
              ) : (
                <IoPlaySharp size={'25px'} />
              )}
            </button>
            <button
              onClick={next}
              disabled={mode === 'video'}
              className="cursor-pointer p-2 text-gray-400 hover:text-white disabled:opacity-30"
            >
              <IoPlaySkipForward size={'20px'} />
            </button>

            <div
              onMouseEnter={() => setVolOpen(true)}
              onMouseLeave={() => setVolOpen(false)}
              className="relative"
            >
              {volOpen && (
                <div className="bg-[#ffffff4a] w-[100px] h-full rounded-sm absolute right-0 z-10">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    defaultValue={Math.round((activeEl()?.volume ?? 1) * 100)}
                    className="w-full h-2 rounded-full cursor-pointer"
                    onChange={changeVolume}
                  />
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
