import express from 'express'
const router = express.Router()

// Memory store for active client connections
const clients = new Map()

router.get('/events', (req, res) => {
  // 1. Identify the client (via query string, headers, or session)
  const clientId = req.query.clientId
  if (!clientId) {
    return res.status(400).send('Client ID is required')
  }

  // 2. Set required SSE HTTP headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  })

  // 3. Keep connection alive with an initial heartbeat/ping
  //res.write('data: {"text": "connected"}\n\n')

  // 4. Store the response object mapped to the client identifier
  clients.set(clientId, res)

  // 5. Remove the client from memory when they disconnect
  req.on('close', () => {
    clients.delete(clientId)
  })
})

// Endpoint to trigger a message to a specific client
router.post('/send-message', express.json(), (req, res) => {
  const { targetClientId, message } = req.body

  console.log(targetClientId, message)
  console.log(clients)

  // Find the specific client's open HTTP connection
  const clientResponse = clients.get(targetClientId)

  if (clientResponse) {
    // Send the formatted SSE string to that client only
    clientResponse.write(`data: ${JSON.stringify(message)}\n\n`)
    return res.status(200).json({ success: true, message: 'Message sent' })
  } else {
    return res.status(404).json({ success: false, error: 'Client not online' })
  }
})

export function sendDataToClient(targetClientId, message) {
  //console.log(targetClientId, message)

  // Find the specific client's open HTTP connection
  const clientResponse = clients.get(targetClientId)

  if (clientResponse) {
    // Send the formatted SSE string to that client only
    clientResponse.write(`data: ${JSON.stringify(message)}\n\n`)
  }
}

export default router
