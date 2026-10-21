import { randomUUID } from 'node:crypto'
import type { Server as HttpServer } from 'node:http'
import { Server } from 'socket.io'
import { fromNodeHeaders } from 'better-auth/node'
import { auth } from './lib/auth'

let io: Server

// No trailing slashes: the browser's Origin header never has one
const allowedOrigins = [
  'http://localhost:5173',
  'https://beanvid.com',
  'https://all-ligr.onrender.com',
]

type Ack = (response: {
  ok: boolean
  error?: string
  message?: unknown
}) => void

export function initSocket(httpServer: HttpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  })

  // Authenticate every connection using the better-auth session cookie
  io.use(async (socket, next) => {
    try {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(socket.handshake.headers),
      })
      if (!session) return next(new Error('Unauthorized'))
      socket.data.userId = session.user.id
      next()
    } catch {
      next(new Error('Unauthorized'))
    }
  })

  io.on('connection', (socket) => {
    const userId: string = socket.data.userId

    // Personal room: every tab/device of this user joins it
    socket.join(`user:${userId}`)

    // Client sends a message through the socket (with an acknowledgement callback)
    socket.on(
      'message:send',
      async (data: { to: string; text: string }, ack?: Ack) => {
        if (!data?.to || !data?.text?.trim()) {
          return ack?.({ ok: false, error: 'Invalid message' })
        }

        const message = {
          id: randomUUID(),
          from: userId,
          to: data.to,
          text: data.text.trim(),
          createdAt: Date.now(),
        }

        // TODO: save `message` to your database here

        io.to(`user:${data.to}`).emit('message:new', message) // recipient
        socket.to(`user:${userId}`).emit('message:new', message) // sender's other tabs
        ack?.({ ok: true, message }) // confirm to the sending tab
      },
    )
  })

  return io
}

// Drop-in replacement for your old SSE helper
export function sendDataToClient(targetUserId: string, message: unknown) {
  io?.to(`user:${targetUserId}`).emit('message:new', message)
}
