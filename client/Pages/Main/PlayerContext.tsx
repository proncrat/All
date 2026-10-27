import {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
  ReactNode,
} from 'react'

export type Song = {
  id: string | number
  title: string
  artist: string
  src: string
  cover?: string
}

// A video that was playing when the user left its watch page
export type VideoItem = {
  id: string | number
  src: string
  title: string
  time: number // seconds to resume from
}

type PlayerCtx = {
  audioRef: React.RefObject<HTMLAudioElement | null>
  current: Song | null
  playing: boolean
  playSong: (song: Song, queue?: Song[]) => void
  toggle: () => void
  next: () => void
  prev: () => void
  playRequest: number
  // video handoff
  video: VideoItem | null
  openVideo: (v: VideoItem) => void
  closeVideo: () => void
}

const PlayerContext = createContext<PlayerCtx | null>(null)

const FADE = 0.4 // seconds

export function PlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [queue, setQueue] = useState<Song[]>([])
  const [current, setCurrent] = useState<Song | null>(null)
  const [playing, setPlaying] = useState(false)
  const [playRequest, setPlayRequest] = useState(0)
  const [video, setVideo] = useState<VideoItem | null>(null)

  // --- fade plumbing ---
  const ctxRef = useRef<AudioContext | null>(null)
  const gainRef = useRef<GainNode | null>(null)
  const pauseTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fadingOut = useRef(false)

  // Built lazily (needs a user gesture) and only once, because an
  // <audio> element can only be connected to the Web Audio graph one time.
  function ensureGraph() {
    if (!ctxRef.current || !gainRef.current) {
      const ctx = new (
        window.AudioContext || (window as any).webkitAudioContext
      )()
      const source = ctx.createMediaElementSource(audioRef.current!)
      const gain = ctx.createGain()
      source.connect(gain).connect(ctx.destination)
      ctxRef.current = ctx
      gainRef.current = gain
    }
    return { ctx: ctxRef.current, gain: gainRef.current.gain }
  }

  function rampTo(value: number) {
    const { ctx, gain } = ensureGraph()
    const now = ctx.currentTime
    gain.cancelScheduledValues(now)
    gain.setValueAtTime(gain.value, now) // start from the current level
    gain.linearRampToValueAtTime(value, now + FADE)
  }

  function clearPauseTimer() {
    if (pauseTimer.current) clearTimeout(pauseTimer.current)
    pauseTimer.current = null
  }

  // fromSilence = true for a freshly loaded track: snap to 0, then fade up
  async function fadeIn(fromSilence = false) {
    const a = audioRef.current
    if (!a) return
    const { ctx, gain } = ensureGraph()
    clearPauseTimer()
    fadingOut.current = false
    setPlaying(true) // flip the icon immediately
    await ctx.resume()

    if (a.paused || fromSilence) {
      gain.cancelScheduledValues(ctx.currentTime)
      gain.setValueAtTime(0, ctx.currentTime)
      try {
        await a.play()
      } catch {
        setPlaying(false)
        return
      }
    }
    rampTo(1)
  }

  function fadeOut() {
    const a = audioRef.current
    if (!a) return
    fadingOut.current = true
    setPlaying(false) // flip the icon immediately
    rampTo(0)
    clearPauseTimer()
    pauseTimer.current = setTimeout(() => {
      a.pause()
      fadingOut.current = false
    }, FADE * 1000)
  }

  useEffect(() => clearPauseTimer, [])

  // --- song logic ---
  const playSong = (song: Song, newQueue?: Song[]) => {
    setVideo(null) // a song replaces any video in the mini player
    if (newQueue) setQueue(newQueue)
    setCurrent(song)
    setPlayRequest((n) => n + 1)
  }

  // load + fade in whenever the current song changes
  useEffect(() => {
    const a = audioRef.current
    if (!current || !a) return
    a.src = current.src
    fadeIn(true)
  }, [current])

  const toggle = () => {
    const a = audioRef.current
    if (!a) return
    // if a fade-out is in progress, clicking again fades back in
    if (a.paused || fadingOut.current) fadeIn()
    else fadeOut()
  }

  const step = (dir: 1 | -1) => {
    if (!current || queue.length === 0) return
    const i = queue.findIndex((s) => s.id === current.id)
    setCurrent(queue[(i + dir + queue.length) % queue.length])
  }

  // --- video logic ---
  // A video replaces any song: stop the audio right away (no fade, the
  // video is taking over) and let the mini player show the video.
  const openVideo = (v: VideoItem) => {
    const a = audioRef.current
    clearPauseTimer()
    fadingOut.current = false
    if (a && !a.paused) a.pause()
    setPlaying(false)
    setVideo(v)
  }

  const closeVideo = () => setVideo(null)

  return (
    <PlayerContext.Provider
      value={{
        audioRef,
        current,
        playing,
        playSong,
        toggle,
        next: () => step(1),
        prev: () => step(-1),
        playRequest,
        video,
        openVideo,
        closeVideo,
      }}
    >
      {children}
      <audio
        ref={audioRef}
        crossOrigin="anonymous"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => step(1)}
      />
    </PlayerContext.Provider>
  )
}

export const usePlayer = () => {
  const ctx = useContext(PlayerContext)
  if (!ctx) throw new Error('usePlayer must be used inside PlayerProvider')
  return ctx
}
