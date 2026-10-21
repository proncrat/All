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

type PlayerCtx = {
  current: Song | null
  playing: boolean
  playSong: (song: Song, queue?: Song[]) => void
  toggle: () => void
  next: () => void
  prev: () => void
}

const PlayerContext = createContext<PlayerCtx | null>(null)

export function PlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [queue, setQueue] = useState<Song[]>([])
  const [current, setCurrent] = useState<Song | null>(null)
  const [playing, setPlaying] = useState(false)

  const [playRequest, setPlayRequest] = useState(0)

  const playSong = (song: Song, newQueue?: Song[]) => {
    if (newQueue) setQueue(newQueue)
    setCurrent(song)
    setPlayRequest((n) => n + 1)
  }

  // load + play whenever the current song changes
  useEffect(() => {
    if (!current || !audioRef.current) return
    audioRef.current.src = current.src
    audioRef.current.play().catch(() => {})
  }, [current])

  const toggle = () => {
    const a = audioRef.current
    if (!a) return
    a.paused ? a.play() : a.pause()
  }

  const step = (dir: 1 | -1) => {
    if (!current || queue.length === 0) return
    const i = queue.findIndex((s) => s.id === current.id)
    setCurrent(queue[(i + dir + queue.length) % queue.length])
  }

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
      }}
    >
      {children}
      <audio
        ref={audioRef}
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
