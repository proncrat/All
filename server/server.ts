import express from 'express'
const server = express()

import user_routes from './Routes/user'
import video_routes from './Routes/video'
import post_routes from './Routes/post'

//import usersRouter from './routes'

import cors from 'cors'
//DO NOT PUT IN PROD IDIOT
server.use(cors())

//everything in public root folder showing fr
server.use(express.static('public'))

server.use(express.json())
//le routes

server.use('/api/v1/profile', user_routes)
server.use('/api/v1/video', video_routes)
server.use('/api/v1/post', post_routes)

export default server
