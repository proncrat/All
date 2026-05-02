import Viewer from 'viewerjs'
import { useEffect, useState } from 'react'

import 'viewerjs/dist/viewer.css'
import Peer from 'peerjs'

import { Link, useParams } from 'react-router'
import { useUserData } from '../../../hooks'

//rethink api structure lil bro

function Live() {
  return <p>Live</p>
}

function Songplayer({ url, isShowing }) {
  if (isShowing) {
    return (
      <div>
        <audio key={url} autoPlay controls>
          <source src={url} type="audio/mpeg" />
        </audio>
      </div>
    )
  }
}

function Song() {
  const [player, setplayer] = useState('')
  const [playerurl, setplayerurl] = useState('')
  const { id } = useParams()
  const { data, isPending, isError, error, isSuccess } = useUserData(
    id,
    'songs',
  )

  if (isPending) {
    return <div>Loading...</div>
  }

  if (isError) {
    return <div>Error: {error.message}</div>
  }

  if (data.length == 0) {
    return 'True adam error (No Songs)'
  }

  function clickHandler(thing) {
    setplayer('showing')
    setplayerurl(thing)
  }

  return (
    <div>
      {data.map((song) => (
        <div
          onClick={() => clickHandler(song.url)}
          key={song.id}
          style={{
            border: 'solid 1px white',
            marginBottom: '15px',
            padding: '10px',
            display: 'flex',
            gap: '20px',
            cursor: 'pointer',
          }}
        >
          <p>{song.name}</p>
          <p>{song.author}</p>
          <p>{song.runtime}</p>
        </div>
      ))}
      <Songplayer isShowing={player} url={playerurl} />
    </div>
  )
}

function Playlist() {
  return <p>playlist</p>
}

export { Playlist, Song, Live }
