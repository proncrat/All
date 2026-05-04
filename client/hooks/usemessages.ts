import { useMutation, useQueryClient } from '@tanstack/react-query'
import { sendMessage } from '../apis/messagesapi'

export function useSendMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data) => {
      return sendMessage(data)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['messages'] }),
  })
}
