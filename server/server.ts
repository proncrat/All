import express from 'express'
const server = express()
import data from './data/test.json'

//import usersRouter from './routes'

import cors from 'cors'
import { getProfile } from './database'
//DO NOT PUT IN PROD IDIOT
server.use(cors())

//everything in public root folder showing fr
server.use(express.static('public'))

server.use(express.json())
//le routes

server.get('/api/v0.1/profile', (req, res) => {
  res.json(data)
})

server.get('/api/v1/profile/:id', async (req, res, next) => {
  try {
    const userId = req.params.id
    const data = await getProfile(userId)
    if (data == null) {
      return res.status(404).send('ticket not found')
    }
    res.json(data)
  } catch (err) {
    next(err)
  }
})

export default server
