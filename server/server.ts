import * as Path from 'node:path'

import express from 'express'
const server = express()

import { toNodeHandler } from 'better-auth/node'
import { auth } from './lib/auth'

import user_routes from './Routes/user'
import video_routes from './Routes/video'
import post_routes from './Routes/post'
import photo_routes from './Routes/photo'
import comment_routes from './Routes/Comments'
import util_routes from './Routes/Util'
import coms_routes from './Routes/Coms'
import test_routes from './Routes/test'
import test_routes_img from './Routes/imguploadtest'
import follow_route from './Routes/Follow'

import cors from 'cors'
//DO NOT PUT IN PROD IDIOT
server.use(
  cors({
    origin: [
      'http://localhost:5173',
      'https://beanvid.com',
      'https://all-ligr.onrender.com/',
    ], // Replace with your frontend's origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed HTTP methods
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  }),
)
//everything in public root folder showing fr
server.use(express.static('public'))

server.all('/api/auth/*splat', toNodeHandler(auth))

server.use(express.json())

//le routes
server.use('/api/v1/profile', user_routes)
server.use('/api/v1/video', video_routes)
server.use('/api/v1/post', post_routes)
server.use('/api/v1/photo', photo_routes)
server.use('/api/v1/comments', comment_routes)
server.use('/api/v1/util', util_routes)
server.use('/api/v1/coms', coms_routes)
server.use('/api/v1/follow', follow_route)
server.use('/api/v1/test', test_routes)
server.use('/api/v1/imgupload', test_routes_img)

if (process.env.NODE_ENV === 'production') {
  server.use(express.static(Path.resolve('public')))
  server.use('/assets', express.static(Path.resolve('./dist/assets')))
  server.get('*splat', (req, res) => {
    res.sendFile(Path.resolve('./dist/index.html'))
  })
}

export default server
