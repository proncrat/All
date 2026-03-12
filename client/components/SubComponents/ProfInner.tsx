import { useQuery } from '@tanstack/react-query'
import request from 'superagent'

import { useOutletContext } from 'react-router'
import Viewer from 'viewerjs'
import { useEffect } from 'react'

import 'viewerjs/dist/viewer.css'

//rethink api structure lil bro
const fetchProfileBasic = async () => {
  try {
    const response = await request.get('http://localhost:3000/api/v0.1/profile')
    return response.body
  } catch (error) {
    throw new Error('Network response was not ok')
  }
}

function Videos() {
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
      {data.videos.map((item) => (
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

export { About, Picture, Playlist, Song, Live, Posts, Videos }
