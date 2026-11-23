import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  addChatMembers,
  getChatMembers,
  leaveChat,
  newChat,
  removeChatMember,
} from '../apis/messagesapi'
import { socket } from '../lib/socket'

export function useNewChat() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: newChat,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['chats'] }),
  })
}

export function useChatMembers(chatId: string | undefined) {
  return useQuery({
    queryKey: ['chatMembers', chatId],
    queryFn: () => getChatMembers(chatId!),
    enabled: Boolean(chatId),
    retry: false, // a 403 means you're not in the chat; don't keep asking
  })
}

export function useAddChatMembers(chatId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (memberIds: number[]) => addChatMembers(chatId!, memberIds),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['chatMembers', chatId] }),
        queryClient.invalidateQueries({ queryKey: ['chats'] }),
        queryClient.invalidateQueries({ queryKey: ['messages', chatId] }),
      ]),
  })
}

/** "Delete" a chat: removes you from it. Others keep the chat and messages. */
export function useLeaveChat() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (chatId: string | number) => leaveChat(chatId),
    onSuccess: (_data, chatId) => {
      queryClient.removeQueries({ queryKey: ['messages', String(chatId)] })
      queryClient.removeQueries({ queryKey: ['chatMembers', String(chatId)] })
      return queryClient.invalidateQueries({ queryKey: ['chats'] })
    },
  })
}

/**
 * Refreshes the chat list and member lists when the server says a chat
 * changed (created, someone added, someone left).
 */
export function useChatUpdates() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const onUpdate = ({ chatid }: { chatid: number }) => {
      queryClient.invalidateQueries({ queryKey: ['chats'] })
      queryClient.invalidateQueries({ queryKey: ['chatMembers', String(chatid)] })
    }
    if (!socket.connected) socket.connect()
    socket.on('chat:update', onUpdate)
    return () => {
      socket.off('chat:update', onUpdate)
    }
  }, [queryClient])
}

/** Chat creator removes someone; their old messages stay. */
export function useRemoveChatMember(chatId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (profileId: number) => removeChatMember(chatId!, profileId),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['chatMembers', chatId] }),
        queryClient.invalidateQueries({ queryKey: ['chats'] }),
        queryClient.invalidateQueries({ queryKey: ['messages', chatId] }),
      ]),
  })
}
