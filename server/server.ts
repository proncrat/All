import express from 'express'
import data from './data/test.json'

const server = express()

import cors from 'cors'
//DO NOT PUT IN PROD IDIOT
server.use(cors())

//everything in public root folder showing fr
//server.use(express.static('public'))

server.get('/api/v0.1/profile', (req, res) => {
  res.json(data)
})

export default server
