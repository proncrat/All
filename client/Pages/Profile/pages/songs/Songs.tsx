import { useParams } from 'react-router'
import { useUserData } from '@/client/hooks'
import { usePlayer, type Song } from '@/client/Pages/Main/PlayerContext'

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white">
    <path d="M8 5v14l11-7z" />
  </svg>
)

const NoteIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white/40">
    <path d="M12 3v10.55A4 4 0 1014 17V7h4V3z" />
  </svg>
)

const PlayingIcon = ({ isPlaying }: { isPlaying: boolean }) => (
  <div className="flex h-4 items-end gap-0.5">
    {[
      { duration: '0.9s', delay: '0s' },
      { duration: '0.7s', delay: '0.15s' },
      { duration: '1.1s', delay: '0.3s' },
    ].map((bar, i) => (
      <span
        key={i}
        className="eq-bar h-full w-1 origin-bottom rounded-sm bg-white"
        style={{
          animation: `equalizer ${bar.duration} ease-in-out ${bar.delay} infinite`,
          animationPlayState: isPlaying ? 'running' : 'paused',
        }}
      />
    ))}
  </div>
)

export function SongList() {
  const { id } = useParams()
  const { data, isPending, isError, error } = useUserData(id, 'songs')
  const { current, playing, playSong } = usePlayer() // must be above the early returns

  if (isPending) {
    return <div>Loading...</div>
  }

  if (isError) {
    return <div>Error: {error.message}</div>
  }

  if (data.length === 0) {
    return <div>True adam error (No Songs)</div>
  }

  // convert API shape -> player shape (this is also the queue for next/prev)
  const queue: Song[] = data.map((s) => ({
    id: s.id,
    title: s.name,
    artist: s.author,
    src: s.url,
  }))

  return (
    <div>
      <ul className="flex flex-col gap-2">
        {data.map((song, i) => {
          const isActive = current?.id === song.id

          return (
            <li
              key={song.id}
              onClick={() => playSong(queue[i], queue)}
              className={`group grid cursor-pointer items-center gap-4 rounded-lg border px-4 py-2.5
                          backdrop-blur-sm transition
                          grid-cols-[40px_1fr_50px] md:grid-cols-[40px_1fr_1fr_60px]
                          ${
                            isActive
                              ? 'border-white/60 bg-white/15'
                              : 'border-white/15 bg-black/45 hover:border-white/40 hover:bg-white/10'
                          }`}
            >
              {/* Icon: note by default, play on hover, bars when active */}
              <div className="relative flex h-10 w-10 items-center justify-center rounded bg-white/10">
                {isActive ? (
                  <PlayingIcon isPlaying={playing} />
                ) : (
                  <>
                    <span className="group-hover:hidden">
                      <NoteIcon />
                    </span>
                    <span className="hidden group-hover:block">
                      <PlayIcon />
                    </span>
                  </>
                )}
              </div>

              {/* Title (+ author underneath on mobile only) */}
              <div className="min-w-0">
                <p className="truncate font-medium text-white">{song.name}</p>
                <p className="truncate text-sm text-white/60 md:hidden">
                  {song.author}
                </p>
              </div>

              {/* Author column (desktop only) */}
              <span className="hidden truncate text-sm text-white/60 md:block">
                {song.author}
              </span>

              {/* Runtime */}
              <span className="text-right text-sm tabular-nums text-white/60">
                {song.runtime}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
