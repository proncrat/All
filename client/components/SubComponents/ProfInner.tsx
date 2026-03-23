import { useQuery } from '@tanstack/react-query'
import request from 'superagent'

import { useOutletContext } from 'react-router'
import Viewer from 'viewerjs'
import { useEffect, useRef, useState } from 'react'

import 'viewerjs/dist/viewer.css'
import Peer from 'peerjs'

import { useParams } from 'react-router'
import { useFruits } from '../../hooks'

//rethink api structure lil bro

function Videos() {
  const { id } = useParams()
  const data = useFruits(id)

  if (data.isPending) {
    return <div>Loading...</div>
  }

  if (data.isError) {
    return <div>Error: {data.error.message}</div>
  }

  if (data.data.length == 0) {
    return 'sub 5 foid (No videos)'
  }

  return (
    <div>
      {data.data.map((item) => (
        <div
          key={item.id}
          style={{
            border: 'solid 1px white',
            marginBottom: '15px',
            padding: '10px',
          }}
        >
          <p>{item.name}</p>
          <p>{item.views}</p>
          <p>{item.author}</p>
          <p>{new Date(item.date).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  )
}

function Posts() {
  const [props] = useOutletContext()
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['videos', props.name],
    queryFn: fetchProfileBasic,
  })

  if (isPending) {
    return <div>Loading...</div>
  }

  if (isError) {
    return <div>Error: {error.message}</div>
  }

  return (
    <div>
      {data.posts.map((item) => (
        <div
          key={item.id}
          style={{
            border: 'solid 1px white',
            marginBottom: '15px',
            padding: '10px',
          }}
        >
          <h2>{item.title}</h2>
          <p>{item.text}</p>
          <p>{new Date(item.date).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  )
}

function Live() {
  return <p>Live</p>
}

function Song() {
  return <p>Song</p>
}

function Playlist() {
  return <p>playlist</p>
}

function Picture() {
  const [props] = useOutletContext()
  const { data, isPending, isError, error, isSuccess } = useQuery({
    queryKey: ['pictures', props.name],
    queryFn: fetchProfileBasic,
  })

  useEffect(() => {
    if (isSuccess === true && data) {
      //doesent update gallery on refetches only on reloads
      const gallery = new Viewer(document.getElementById('images'))
      gallery.update()
    }
  }, [data, isSuccess]) // Add 'data' and 'status' to the dependency array

  console.log(isSuccess)

  if (isPending) {
    return <div>Loading...</div>
  }

  if (isError) {
    return <div>Error: {error.message}</div>
  }

  return (
    <div>
      <div id="images">
        {data.photos.map((item) => (
          <div key={item.id}>
            <p>{item.name}</p>
            <img
              data-original={item.url}
              alt="Lowkey dont know"
              src={item.thumburl}
            ></img>
          </div>
        ))}
      </div>
    </div>
  )
}

function About() {
  const [props] = useOutletContext()
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['about', props.name],
    queryFn: fetchProfileBasic,
  })

  if (isPending) {
    return <div>Loading...</div>
  }

  if (isError) {
    return <div>Error: {error.message}</div>
  }

  return (
    <div>
      <h2>Describe</h2>
      <p>{data.About.description}</p>
      <h2>Links</h2>
      {data.About.links.map((item) => (
        <div key={item.id}>
          <a href={item.url} target="_blank" rel="noopener noreferrer">
            {item.name}
          </a>
        </div>
      ))}
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
