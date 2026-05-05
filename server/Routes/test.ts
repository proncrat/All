import express from 'express'
const router = express.Router()

let clients = []

router.get('/', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  clients.push(res)

  // Remove client on disconnect
  req.on('close', () => {
    clients = clients.filter((c) => c !== res)
    res.end()
  })
})

export function sendDataToAllClients(data) {
  clients.forEach((client) => {
    client.write(`data: ${JSON.stringify(data)}\n\n`)
  })
}

export default router
