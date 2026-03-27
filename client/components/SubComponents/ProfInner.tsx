import Viewer from 'viewerjs'
import { useEffect, useRef, useState } from 'react'

import 'viewerjs/dist/viewer.css'
import Peer from 'peerjs'

import { Link, useParams } from 'react-router'
import { useUserData } from '../../hooks'

//rethink api structure lil bro

function Videos() {
  const { id } = useParams()

  const { data, isPending, isError, error, isSuccess } = useUserData(
    id,
    'videos',
  )

  console.log(data)

  if (isPending) {
    return <div>Loading...</div>
  }

  if (isError) {
    return <div>Error: {error.message}</div>
  }

  if (data.length == 0) {
    return 'True adam error (No videos)'
  }

  if (isSuccess) {
    return (
      <div className="thumbnailcontainer">
        {data.map((item) => (
          <Link key={item.id} to={`/video/${item.id}`}>
            <div className="thumbnailthing">
              <img alt="A THUMBNAIL" src={item.thumbnail_link} />
              <p>{item.name}</p>
              <p>{item.views} views</p>
              <p>{item.author}</p>
              <p>{new Date(item.post_date).toLocaleDateString()}</p>
            </div>
          </Link>
        ))}
      </div>
    )
  }
}

function Posts() {
  const { id } = useParams()
  const { data, isPending, isError, error, isSuccess } = useUserData(
    id,
    'posts',
  )

  if (isPending) {
    return <div>Loading...</div>
  }

  if (isError) {
    return <div>Error: {error.message}</div>
  }

  if (data.length == 0) {
    return 'True adam error (No posts)'
  }

  return (
    <div>
      {data.map((item) => (
        <div
          key={item.id}
          style={{
            border: 'solid 1px white',
            marginBottom: '15px',
            padding: '10px',
          }}
        >
          <h2>{item.title}</h2>
          <p>{item.the_post}</p>
          <p>{new Date(item.post_date).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  )
}

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

function Picture() {
  const { id } = useParams()
  const { data, isPending, isError, error, isSuccess } = useUserData(
    id,
    'photos',
  )

  useEffect(() => {
    if (isSuccess === true && data.length > 0) {
      //doesent update gallery on refetches only on reloads
      const gallery = new Viewer(document.getElementById('images'))
      gallery.update()
    }
  }, [data, isSuccess]) // Add 'data' and 'status' to the dependency array

  if (isPending) {
    return <div>Loading...</div>
  }

  if (isError) {
    return <div>Error: {error.message}</div>
  }

  console.log(data)

  if (data.length == 0) {
    return 'True adam error (No photos)'
  }

  return (
    <div>
      <div id="images">
        {data.map((item) => (
          <div key={item.id}>
            <p>{item.name}</p>
            <img
              data-original={item.url}
              alt={item.describe}
              src={item.thumburl}
            ></img>
          </div>
        ))}
      </div>
    </div>
  )
}

function About() {
  const { id } = useParams()
  const { data, isPending, isError, error, isSuccess } = useUserData(
    id,
    'description',
  )

  if (isPending) {
    return <div>Loading...</div>
  }

  if (isError) {
    return <div>Error: {error.message}</div>
  }

  return (
    <div>
      <h2>Describe</h2>
      <p>{data.description}</p>
      <h2>Links</h2>
      {/*data.links.map((item) => (
        <div key={item.id}>
          <a href={item.url} target="_blank" rel="noopener noreferrer">
            {item.name}
          </a>
        </div>
      ))*/}
    </div>
  )
}

function Call() {
  const [id2, setInputValue] = useState('')
  const [id, setId] = useState<number>(0)
  const peer = useRef()
  const conn = useRef()

  function start_service() {
    peer.current = new Peer()
    peer.current.on('open', function (id) {
      setId(id)
      console.log('My peer ID is: ' + id)
    })
  }

  useEffect(() => {
    start_service()
  }, [])

  function connect(id) {
    conn.current = peer.current.connect(id)
  }

  function send(message) {
    conn.current.on('open', function () {
      conn.send(message)
    })
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    connect(id2)
  }

  const handleInputChange = (event) => {
    setInputValue(event.target.value)
  }

  function debug() {
    console.log(peer.current)
    console.log(conn.current)
  }

  return (
    <div>
      <p>Your id : {id}</p>
      <p>Friend id : {id2}</p>
      <form onSubmit={handleSubmit}>
        <label htmlFor="simpleInput">Enter text:</label>
        <input
          id="simpleInput"
          type="text"
          value={id2} // Controlled component: value is tied to state
          onChange={handleInputChange} // Update state on each change
        />
        <button type="submit">Submit</button>
      </form>
      <div>
        <form onSubmit={handleSubmit}>
          <label htmlFor="simpleInput">Enter text:</label>
          <input
            id="simpleInput"
            type="text"
            value={id2} // Controlled component: value is tied to state
            onChange={handleInputChange} // Update state on each change
          />
          <button type="submit">Submit</button>
        </form>
      </div>
      <button onClick={debug}>Debug</button>
    </div>
  )
}

export { Call, About, Picture, Playlist, Song, Live, Posts, Videos }
