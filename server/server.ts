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

import cors from 'cors'
//DO NOT PUT IN PROD IDIOT
server.use(
  cors({
    origin: 'http://localhost:5173', // Replace with your frontend's origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed HTTP methods
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  }),
)

server.all('/api/auth/*splat', toNodeHandler(auth))

server.use(express.json())

//everything in public root folder showing fr
server.use(express.static('public'))

//le routes
server.use('/api/v1/profile', user_routes)
server.use('/api/v1/video', video_routes)
server.use('/api/v1/post', post_routes)
server.use('/api/v1/photo', photo_routes)
server.use('/api/v1/comments', comment_routes)
server.use('/api/v1/util', util_routes)
server.use('/api/v1/coms', coms_routes)

export default server
