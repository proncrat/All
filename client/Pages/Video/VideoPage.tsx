import { Link, useParams } from 'react-router'
import { useVideo } from '../../hooks'
import { AiFillLike, AiFillDislike } from 'react-icons/ai'

import { useEffect, useRef } from 'react'
import { usePlayer } from '../Main/PlayerContext'
import { useSearchParams } from 'react-router'

type VideoData = { video_link: string; name: string }

function WatchPage({
  id,
  video,
  startTime,
}: {
  id: string
  video: VideoData
  startTime?: number
}) {
  const { openVideo, closeVideo } = usePlayer()
  const videoRef = useRef<HTMLVideoElement>(null)

  const wasPlaying = useRef(false)
  const lastTime = useRef(startTime ?? 0)

  useEffect(() => {
    closeVideo()
    wasPlaying.current = false
    lastTime.current = startTime ?? 0

    return () => {
      if (wasPlaying.current) {
        openVideo({
          id,
          src: video.video_link,
          title: video.name,
          time: lastTime.current,
        })
      }
    }
  }, [id])

  return (
    <video
      ref={videoRef}
      src={video.video_link}
      controls
      autoPlay
      className="w-full"
      onLoadedMetadata={(e) => {
        if (startTime && startTime > 0) {
          e.currentTarget.currentTime = startTime
        }
      }}
      onPlay={() => {
        wasPlaying.current = true
      }}
      onPause={(e) => {
        if (e.currentTarget.isConnected) wasPlaying.current = false
      }}
      onEnded={() => {
        wasPlaying.current = false
      }}
      onTimeUpdate={(e) => {
        lastTime.current = e.currentTarget.currentTime
      }}
    />
  )
}

function Video() {
  const { id } = useParams()
  const { data, isPending, isError, error } = useVideo(id)

  const [searchParams] = useSearchParams()

  const timeParam = searchParams.get('time')
  const parsed = timeParam !== null ? Number(timeParam) : NaN
  const startTime = Number.isFinite(parsed) && parsed > 0 ? parsed : undefined

  if (isPending) {
    return <div>Loading...</div>
  }

  if (isError) {
    return <div>Error: {error.message}</div>
  }

  if (data.length == 0) {
    return 'True adam error (No Results)'
  }

  return (
    <div className="max-w-375 m-auto p-4">
      <div className="w-[80%]">
        <WatchPage id={id!} video={data} startTime={startTime} />
      </div>
      <h1 className="text-2xl mb-3 mt-3">{data.name}</h1>
      <div className="mb-5 flex items-center gap-20">
        <Link to={'/profile/' + data.author_id}>
          <div className="flex gap-4">
            <img
              className="rounded-full w-12 aspect-square"
              alt="some pfp"
              src={data.pfp}
            />
            <div>
              <p className="text-lg">{data.username}</p>
              <p className="text-sm text-zinc-400">
                {data.followers} followers
              </p>
            </div>
          </div>
        </Link>
        <div className="flex gap-3">
          <AiFillLike size={'25px'} />
          <p>{data.likes}</p>
          <AiFillDislike size={'25px'} />
          <p>{data.dislikes}</p>
        </div>
      </div>

      <div className="flex gap-4 mb-3">
        <p>{data.views} views</p>
        <p>{new Date(data.post_date).toLocaleString()}</p>
      </div>
      <p>{data.description}</p>
    </div>
  )
}

export default Video
