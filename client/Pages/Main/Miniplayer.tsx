import {
  IoPlaySkipForward,
  IoPlaySkipBackSharp,
  IoPlaySharp,
  IoPauseSharp,
  IoVolumeHighSharp,
  IoShuffle,
} from 'react-icons/io5'
import { Link } from 'react-router'
import { useEffect, useRef, useState } from 'react'
import { usePlayer } from './PlayerContext'

function fmt(s) {
  if (!Number.isFinite(s)) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

export function Miniplayer({ width }) {
  const { audioRef, current, playing, toggle, next, prev } = usePlayer()

  // layout is derived from the prop during render: no effect, no DOM mutation
  const isCollapsed = String(width) === '60'

  const scrubbing = useRef(false)
  const volWrap = useRef(null)
  const closeTimer = useRef(null)
  const draggingVol = useRef(false)

  const [volstate, setvolstate] = useState(false)
  const [volume, setVolume] = useState(100) // slider scale: 0-100
  const [cur, setCur] = useState(0)
  const [dur, setDur] = useState(0)
  const [isScrubbing, setIsScrubbing] = useState(false)

  // progress is derived from state, so it survives the bar unmounting/remounting
  const progress = dur ? Math.min(100, (cur / dur) * 100) : 0

  // progress bar + time labels follow the shared audio element
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const sync = () => {
      setDur(audio.duration || 0)
      if (scrubbing.current) return // don't fight the user's drag
      setCur(audio.currentTime)
    }

    audio.addEventListener('timeupdate', sync)
    audio.addEventListener('loadedmetadata', sync)
    audio.addEventListener('durationchange', sync)
    sync()
    return () => {
      audio.removeEventListener('timeupdate', sync)
      audio.removeEventListener('loadedmetadata', sync)
      audio.removeEventListener('durationchange', sync)
    }
  }, [audioRef])

  // keep the volume slider in sync with the real audio volume
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onVol = () => setVolume(Math.round(audio.volume * 100))
    audio.addEventListener('volumechange', onVol)
    onVol()
    return () => audio.removeEventListener('volumechange', onVol)
  }, [audioRef])

  function changevolume(e) {
    // the 'volumechange' listener above updates the slider state
    audioRef.current.volume = Number(e.target.value) / 100
  }

  // scroll wheel over the volume control changes the volume.
  // Needs a native non-passive listener so we can stop the page from scrolling.
  useEffect(() => {
    const el = volWrap.current
    if (!el) return
    const onWheel = (e) => {
      e.preventDefault()
      const audio = audioRef.current
      if (!audio) return
      const step = e.deltaY < 0 ? 0.05 : -0.05 // scroll up = louder
      audio.volume = Math.min(1, Math.max(0, audio.volume + step))
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [audioRef])

  // hover with a short grace period so the popup doesn't vanish instantly
  function openVol() {
    clearTimeout(closeTimer.current)
    setvolstate(true)
  }

  function closeVol() {
    clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => {
      if (!draggingVol.current) setvolstate(false)
    }, 500)
  }

  // keep the popup open while dragging the slider, even if the cursor strays
  function volDragStart() {
    draggingVol.current = true
    const end = () => {
      draggingVol.current = false
      closeVol()
      window.removeEventListener('pointerup', end)
    }
    window.addEventListener('pointerup', end)
  }

  useEffect(() => () => clearTimeout(closeTimer.current), [])

  // maps pointer position to a time, updates the label (and so the bar), returns the time
  function previewSeek(e) {
    const audio = audioRef.current
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
    const t = ratio * (audio.duration || 0)
    setCur(t)
    return t
  }

  function scrubStart(e) {
    if (!audioRef.current?.duration) return
    scrubbing.current = true
    setIsScrubbing(true) // disables the width transition while dragging
    e.currentTarget.setPointerCapture(e.pointerId) // keep dragging outside the bar
    previewSeek(e)
  }

  function scrubMove(e) {
    if (scrubbing.current) previewSeek(e)
  }

  function scrubEnd(e) {
    if (!scrubbing.current) return
    audioRef.current.currentTime = previewSeek(e) // seek once, on release
    scrubbing.current = false
    setIsScrubbing(false)
  }

  return (
    <div
      className={`rounded-sm w-full overflow-hidden ${
        isCollapsed
          ? 'bg-transparent'
          : 'bg-black/30 p-2 border border-zinc-800'
      }`}
    >
      {!isCollapsed && current?.cover && (
        <img
          className="rounded-sm mb-2"
          src={current.cover}
          alt={current.title ? `${current.title} cover` : 'Cover'}
        />
      )}

      <div className="flex flex-col justify-center items-center">
        {!isCollapsed && (
          <>
            <div className="rounded-sm mb-2">
              <Link to={'/'}>
                <p>{current?.title ?? 'Nothing playing'}</p>
              </Link>
            </div>

            <div className="w-full">
              <div
                onPointerDown={scrubStart}
                onPointerMove={scrubMove}
                onPointerUp={scrubEnd}
                onPointerCancel={scrubEnd}
                className="group py-2 cursor-pointer touch-none"
              >
                <div className="w-full h-1 group-hover:h-1.5 transition-[height] bg-[#6363633b] rounded-sm overflow-hidden">
                  <div
                    style={{ width: `${progress}%` }}
                    className={`h-full rounded-sm bg-white ${
                      isScrubbing ? '' : 'transition-[width]'
                    }`}
                  />
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-400 tabular-nums">
                <span>{fmt(cur)}</span>
                <span>{fmt(dur)}</span>
              </div>
            </div>
          </>
        )}

        <div className="flex gap-3 items-center">
          <button className="cursor-pointer p-2 text-gray-400 hover:text-white">
            <IoShuffle size={'20px'} />
          </button>
          <button
            onClick={prev}
            className="cursor-pointer p-2 text-gray-400 hover:text-white"
          >
            <IoPlaySkipBackSharp size={'20px'} />
          </button>
          <button
            onClick={toggle}
            className="cursor-pointer p-2 hover:text-gray-400"
          >
            {!playing ? (
              <IoPlaySharp size={'25px'} />
            ) : (
              <IoPauseSharp size={'25px'} />
            )}
          </button>
          <button
            onClick={next}
            className="cursor-pointer p-2 text-gray-400 hover:text-white"
          >
            <IoPlaySkipForward size={'20px'} />
          </button>

          <div
            ref={volWrap}
            onMouseEnter={openVol}
            onMouseLeave={closeVol}
            className="relative"
          >
            {/* always mounted so it can fade; pointer-events-none while hidden
                stops the invisible panel from catching the mouse.
                pb-2 (not margin) keeps the hover area continuous. */}
            <div
              className={`absolute bottom-full right-0 pb-2 z-20 transition-opacity duration-200 ${
                volstate ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              <div className="bg-mist-700 rounded-md px-3 py-2 shadow-lg">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={changevolume}
                  onPointerDown={volDragStart}
                  className="w-28 h-1 cursor-pointer accent-white block"
                />
              </div>
            </div>
            <button className="cursor-pointer p-2 text-gray-400 hover:text-white">
              <IoVolumeHighSharp size={'20px'} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
