/*
import server from './server.ts'

const port = 3000

server.listen(port, function () {
  // eslint-disable-next-line no-console
  console.log('Server is listening on http://localhost:' + port)
})
*/

import http from 'node:http'
import server from './server.ts'
import { initSocket } from './socket.ts'

const port = 3000

const httpServer = http.createServer(server)
initSocket(httpServer)

httpServer.listen(port, function () {
  // eslint-disable-next-line no-console
  console.log('Server is listening on http://localhost:' + port)
})
