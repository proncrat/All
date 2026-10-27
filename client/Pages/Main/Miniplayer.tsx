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
import { usePlayer } from './PlayerContext'

function fmt(s) {
  if (!Number.isFinite(s)) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

export function Miniplayer({ width }) {
  const { audioRef, current, playing, toggle, next, prev, video, closeVideo } =
    usePlayer()

  // layout is derived from the prop during render: no effect, no DOM mutation
  const isCollapsed = String(width) === '60'

  // --- song vs video ---
  const videoRef = useRef(null)
  const [videoPlaying, setVideoPlaying] = useState(false)
  const mode = video ? 'video' : 'song'
  const isPlaying = mode === 'video' ? videoPlaying : playing
  // the media element every control below acts on
  const getEl = () => (mode === 'video' ? videoRef.current : audioRef.current)

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

  // stop the <video> when the video is closed or replaced by a song
  useEffect(() => {
    if (!video) videoRef.current?.pause()
  }, [video])

  // progress bar + time labels follow whichever element is active
  useEffect(() => {
    const el = mode === 'video' ? videoRef.current : audioRef.current
    if (!el) return

    const sync = () => {
      setDur(el.duration || 0)
      if (scrubbing.current) return // don't fight the user's drag
      setCur(el.currentTime)
    }

    el.addEventListener('timeupdate', sync)
    el.addEventListener('loadedmetadata', sync)
    el.addEventListener('durationchange', sync)
    sync()
    return () => {
      el.removeEventListener('timeupdate', sync)
      el.removeEventListener('loadedmetadata', sync)
      el.removeEventListener('durationchange', sync)
    }
  }, [audioRef, mode, video?.src])

  // keep the volume slider in sync with the active element's real volume
  useEffect(() => {
    const el = mode === 'video' ? videoRef.current : audioRef.current
    if (!el) return
    const onVol = () => setVolume(Math.round(el.volume * 100))
    el.addEventListener('volumechange', onVol)
    onVol()
    return () => el.removeEventListener('volumechange', onVol)
  }, [audioRef, mode])

  function changevolume(e) {
    // the 'volumechange' listener above updates the slider state
    const el = getEl()
    if (el) el.volume = Number(e.target.value) / 100
  }

  // scroll wheel over the volume control changes the volume.
  // Needs a native non-passive listener so we can stop the page from scrolling.
  useEffect(() => {
    const wrap = volWrap.current
    if (!wrap) return
    const onWheel = (e) => {
      e.preventDefault()
      const el = mode === 'video' ? videoRef.current : audioRef.current
      if (!el) return
      const step = e.deltaY < 0 ? 0.05 : -0.05 // scroll up = louder
      el.volume = Math.min(1, Math.max(0, el.volume + step))
    }
    wrap.addEventListener('wheel', onWheel, { passive: false })
    return () => wrap.removeEventListener('wheel', onWheel)
  }, [audioRef, mode])

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

  // play / pause: videos use the element directly, songs use your fade toggle
  function togglePlay() {
    if (mode === 'video') {
      const v = videoRef.current
      if (!v) return
      if (v.paused) v.play().catch(() => {})
      else v.pause()
    } else {
      toggle()
    }
  }

  // maps pointer position to a time, updates the label (and so the bar), returns the time
  function previewSeek(e) {
    const el = getEl()
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
    const t = ratio * (el?.duration || 0)
    setCur(t)
    return t
  }

  function scrubStart(e) {
    if (!getEl()?.duration) return
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
    getEl().currentTime = previewSeek(e) // seek once, on release
    scrubbing.current = false
    setIsScrubbing(false)
  }

  const title = mode === 'video' ? video.title : current?.title
  const href =
    mode === 'video'
      ? `/video/${video.id}?time=${Math.floor(videoRef.current.currentTime)}`
      : '/'

  return (
    <div
      className={`rounded-sm w-full overflow-hidden ${
        isCollapsed
          ? 'bg-transparent'
          : 'bg-black/30 p-2 border border-zinc-800'
      }`}
    >
      {/* Always mounted so the ref is stable and audio keeps playing even when
          the sidebar is collapsed. Only visible for a video in expanded mode. */}
      <video
        ref={videoRef}
        src={video?.src}
        className={`rounded-sm mb-2 w-full aspect-video bg-black ${
          mode === 'video' && !isCollapsed ? '' : 'hidden'
        }`}
        onPlay={() => setVideoPlaying(true)}
        onPause={() => setVideoPlaying(false)}
        onLoadedMetadata={() => {
          const v = videoRef.current
          if (!v || !video) return
          v.currentTime = video.time // resume where the watch page left off
          v.play().catch(() => {})
        }}
        onEnded={closeVideo}
      />

      {!isCollapsed && mode === 'song' && current?.cover && (
        <img
          className="rounded-sm mb-2"
          src={current.cover}
          alt={current.title ? `${current.title} cover` : 'Cover'}
        />
      )}

      <div className="flex flex-col justify-center items-center">
        {!isCollapsed && (
          <>
            <div className="rounded-sm mb-2 flex w-full items-center justify-between gap-2">
              <Link to={href} className="truncate" title={title}>
                <p className="truncate">{title ?? 'Nothing playing'}</p>
              </Link>
              {mode === 'video' && (
                <button
                  onClick={closeVideo}
                  className="cursor-pointer text-gray-400 hover:text-white"
                  aria-label="Close video"
                >
                  <IoClose size={'20px'} />
                </button>
              )}
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
            disabled={mode === 'video'}
            className="cursor-pointer p-2 text-gray-400 hover:text-white disabled:opacity-30"
          >
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
          <button
            onClick={next}
            disabled={mode === 'video'}
            className="cursor-pointer p-2 text-gray-400 hover:text-white disabled:opacity-30"
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
