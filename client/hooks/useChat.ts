import { useMutation, useQueryClient } from '@tanstack/react-query'
import { newChat } from '../apis/messagesapi'

export function useNewChat() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data) => {
      return newChat(data)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['chats'] }),
  })
}
