// client/lib/socket.ts
import { io } from 'socket.io-client'

export const socket = io('http://localhost:3000', {
  autoConnect: false,
  withCredentials: true, // without this the better-auth cookie isn't sent and io.use rejects you
})
