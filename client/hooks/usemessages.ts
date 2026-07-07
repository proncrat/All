import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteMessage, sendMessage } from '../apis/messagesapi'

export function useSendMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data) => {
      return sendMessage(data)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['messages'] }),
  })
}

export function useDeleteMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data) => {
      return deleteMessage(data)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['messages'] }),
    onError: () => {
      console.log('Problem??')
    },
  })
}
