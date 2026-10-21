// client/hooks/useMessageSocket.ts
import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { socket } from '../lib/socket'

/**
 * Keeps the messages list for a conversation fresh over the websocket.
 * The socket payload is a raw DB row, so instead of patching the cache
 * we refetch, which returns the joined shape ShownMessage expects.
 */
export function useMessageSocket(conversationId: string | undefined) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!conversationId) return

    const queryKey = ['messages', conversationId] // must match useMessages
    const refetch = () => queryClient.invalidateQueries({ queryKey })

    const onNew = (msg: Message) => {
      if (String(msg.chatid) === String(conversationId)) refetch()
    }

    // on every (re)connect, refetch to pick up anything missed while offline
    const onConnect = refetch

    const onError = (err: Error) => console.error('Socket error:', err.message)

    if (!socket.connected) socket.connect()

    socket.on('message:new', onNew)
    socket.on('connect', onConnect)
    socket.on('connect_error', onError)

    return () => {
      socket.off('message:new', onNew)
      socket.off('connect', onConnect)
      socket.off('connect_error', onError)
    }
  }, [conversationId, queryClient])
}
