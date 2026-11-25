import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Volume1, Volume2, VolumeX } from 'lucide-react'

const VOLUME_KEY = 'shorts-volume'

/** Saved volume (0-1) shared by all shorts, so it carries between them. */
function savedVolume() {
  const v = Number(localStorage.getItem(VOLUME_KEY))
  return Number.isFinite(v) && localStorage.getItem(VOLUME_KEY) !== null
    ? Math.min(1, Math.max(0, v))
    : 1
}

/** 75 -> "1:15" */
function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return '0:00'
  const s = Math.floor(seconds)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

/**
 * Vertical short player: click to play/pause, volume control top-left,
 * title + expandable description along the bottom, and an optional `side`
 * rail (e.g. a vertical ReactionBar) to the right of the video.
 */
export function Shortz({
  src = 'video/short1.mp4',
  poster = '',
  loop = true,
  autoPlay = false,
  title,
  description,
  side,
}: {
  src?: string
  poster?: string
  loop?: boolean
  /** Start playing on mount (falls back to paused if the browser blocks it). */
  autoPlay?: boolean
  title?: string
  description?: string | null
  side?: ReactNode
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const hideTimeout = useRef<ReturnType<typeof setTimeout>>(undefined)

  const [isPlaying, setIsPlaying] = useState(false)
  const [showOverlay, setShowOverlay] = useState(false)
  const [animKey, setAnimKey] = useState(0) // re-triggers the pop animation

  const [volume, setVolume] = useState(savedVolume)
  const [muted, setMuted] = useState(false)
  const [expanded, setExpanded] = useState(false)

  // Scroll over the volume button to change volume. Attached natively because
  // React's onWheel is passive and can't stop the page from scrolling.
  const volBox = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = volBox.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const step = e.deltaY < 0 ? 0.05 : -0.05
      setMuted(false)
      setVolume(
        (v) => Math.round(Math.min(1, Math.max(0, v + step)) * 100) / 100,
      )
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  const seekBar = useRef<HTMLDivElement>(null)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [scrubbing, setScrubbing] = useState(false)

  useEffect(() => () => clearTimeout(hideTimeout.current), [])

  useEffect(() => {
    if (autoPlay) videoRef.current?.play().catch(() => {})
  }, [autoPlay])

  // Keep the element in sync with the volume state, and remember it
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.volume = volume
    v.muted = muted || volume === 0
    localStorage.setItem(VOLUME_KEY, String(volume))
  }, [volume, muted])

  const flashIcon = (playing: boolean) => {
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

  const onTimeUpdate = () => {
    const v = videoRef.current
    if (v && !scrubbing) setTime(v.currentTime)
  }

  /** Jumps to the point on the bar under the pointer. */
  const seekToPointer = (clientX: number) => {
    const bar = seekBar.current
    const v = videoRef.current
    if (!bar || !v || !duration) return
    const rect = bar.getBoundingClientRect()
    const frac = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
    v.currentTime = frac * duration
    setTime(frac * duration)
  }

  const skip = (seconds: number) => {
    const v = videoRef.current
    if (!v || !duration) return
    v.currentTime = Math.min(duration, Math.max(0, v.currentTime + seconds))
    setTime(v.currentTime)
  }

  // Keyboard: space / k play-pause, arrows skip 5s, j / l skip 10s, m mute
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement
      if (el.closest('input, textarea, [contenteditable="true"]')) return
      if (e.ctrlKey || e.metaKey || e.altKey) return
      const actions: Record<string, () => void> = {
        ' ': togglePlay,
        k: togglePlay,
        ArrowLeft: () => skip(-5),
        ArrowRight: () => skip(5),
        j: () => skip(-10),
        l: () => skip(10),
        m: () => setMuted((m) => !m),
      }
      const action = actions[e.key]
      if (action) {
        e.preventDefault()
        action()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const progress = duration ? (time / duration) * 100 : 0

  const silent = muted || volume === 0
  const VolumeIcon = silent ? VolumeX : volume < 0.5 ? Volume1 : Volume2

  return (
    // Phone: the video fills the whole area and the side rail floats over it.
    // md+: a rounded 9:16 video with the rail beside it.
    <div className="relative flex h-full w-full items-end justify-center md:gap-3 md:p-2">
      <div
        onClick={togglePlay}
        className="relative h-full w-full cursor-pointer overflow-hidden bg-black md:aspect-9/16 md:w-auto md:max-w-full md:rounded-xl"
      >
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          loop={loop}
          playsInline
          onTimeUpdate={onTimeUpdate}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onDurationChange={(e) => setDuration(e.currentTarget.duration)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          className="h-full w-full object-cover md:object-contain"
        />

        {/* Volume: mute button, slider slides out on hover */}
        <div
          ref={volBox}
          onClick={(e) => e.stopPropagation()}
          title="Scroll to change volume"
          className="group/vol absolute left-3 top-3 flex items-center rounded-full bg-black/50 p-1 backdrop-blur-sm transition-all duration-200 hover:gap-2 hover:pr-3 focus-within:gap-2 focus-within:pr-3"
        >
          <button
            type="button"
            aria-label={silent ? 'Unmute' : 'Mute'}
            onClick={() => {
              if (silent && volume === 0) setVolume(0.5)
              setMuted(!silent)
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full text-white hover:bg-white/15"
          >
            <VolumeIcon size={18} />
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            aria-label="Volume"
            value={silent ? 0 : volume}
            onChange={(e) => {
              setVolume(Number(e.target.value))
              setMuted(false)
            }}
            className="w-0 cursor-pointer accent-white opacity-0 transition-all duration-200 group-hover/vol:w-20 group-hover/vol:opacity-100 focus:w-20 focus:opacity-100"
          />
        </div>

        {/* Play / pause pop */}
        <div
          key={animKey}
          className="pointer-events-none absolute left-1/2 top-1/2 flex h-[72px] w-[72px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 transition-opacity duration-300"
          style={{
            opacity: showOverlay ? 1 : 0,
            animation: showOverlay ? 'vpp-pop 0.4s ease' : 'none',
          }}
        >
          {isPlaying ? <PlayIcon /> : <PauseIcon />}
        </div>

        {/* Title + description */}
        {(title || description) && (
          <div
            className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent pb-4 pl-4 pr-20 pt-12 md:pr-4 ${
              expanded ? 'max-h-[70%] overflow-y-auto' : ''
            }`}
          >
            {title && (
              <h1 className="text-base font-semibold leading-snug text-white">
                {title}
              </h1>
            )}
            {description && (
              <p
                role="button"
                tabIndex={0}
                aria-expanded={expanded}
                title={expanded ? 'Show less' : 'Show more'}
                onClick={(e) => {
                  e.stopPropagation()
                  setExpanded((x) => !x)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setExpanded((x) => !x)
                  }
                }}
                className={`mt-1 cursor-pointer whitespace-pre-line break-words text-sm text-white/80 ${
                  expanded ? '' : 'line-clamp-1'
                }`}
              >
                {description}
              </p>
            )}
          </div>
        )}

        {/* Seek bar: click or drag anywhere along it. The tall transparent
            strip is the hit area; the visible bar grows while hovered. */}
        <div
          ref={seekBar}
          role="slider"
          tabIndex={0}
          aria-label="Seek"
          aria-valuemin={0}
          aria-valuemax={Math.round(duration)}
          aria-valuenow={Math.round(time)}
          aria-valuetext={`${formatTime(time)} of ${formatTime(duration)}`}
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => {
            e.stopPropagation()
            e.currentTarget.setPointerCapture(e.pointerId)
            setScrubbing(true)
            seekToPointer(e.clientX)
          }}
          onPointerMove={(e) => scrubbing && seekToPointer(e.clientX)}
          onPointerUp={(e) => {
            e.currentTarget.releasePointerCapture(e.pointerId)
            setScrubbing(false)
          }}
          onPointerCancel={() => setScrubbing(false)}
          className="group/seek absolute inset-x-0 bottom-0 flex h-4 cursor-pointer touch-none items-end"
        >
          <div
            className={`relative w-full bg-white/25 transition-[height] duration-150 ${
              scrubbing ? 'h-1.5' : 'h-1 group-hover/seek:h-1.5'
            }`}
          >
            <div
              className="h-full bg-white"
              style={{ width: `${progress}%` }}
            />
            <div
              className={`absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow transition-transform duration-150 ${
                scrubbing ? 'scale-100' : 'scale-0 group-hover/seek:scale-100'
              }`}
              style={{ left: `${progress}%` }}
            />
          </div>
        </div>

        {/* Time readout while scrubbing */}
        {scrubbing && (
          <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 rounded-md bg-black/70 px-2 py-1 text-xs tabular-nums text-white">
            {formatTime(time)} / {formatTime(duration)}
          </div>
        )}

        <style>{`
          @keyframes vpp-pop {
            0%   { transform: translate(-50%, -50%) scale(0.7); opacity: 0; }
            40%  { transform: translate(-50%, -50%) scale(1.08); opacity: 1; }
            100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          }
        `}</style>
      </div>

      {side && (
        <div className="absolute bottom-6 right-2 z-10 shrink-0 md:static md:pb-2">
          {side}
        </div>
      )}
    </div>
  )
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[34px] w-[34px]">
      <path fill="#fff" d="M8 5v14l11-7z" />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[34px] w-[34px]">
      <path fill="#fff" d="M6 5h4v14H6zM14 5h4v14h-4z" />
    </svg>
  )
}
