import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteMessage, editMessage, sendMessage } from '../apis/messagesapi'

export function useSendMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    // Only `data` goes to the server; `sender` is just for the optimistic row
    mutationFn: async ({ data }) => {
      //WIll he forget about this??
      await new Promise((r) => setTimeout(r, 500))
      return sendMessage(data)
    },

    onMutate: async ({ data, sender }) => {
      const key = ['messages', data.chatid] // match your actual query key
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData(key)

      queryClient.setQueryData(key, (old = []) => [
        ...old,
        {
          ...data,
          id: `temp-${crypto.randomUUID()}`,
          senderid: sender.id,
          name: sender.name,
          pfp: sender.pfp,
          date: Date.now(),
          pending: true,
        },
      ])

      return { previous, key }
    },

    onError: (_err, _vars, context) => {
      if (context) queryClient.setQueryData(context.key, context.previous)
    },

    onSettled: (_data, _err, vars) =>
      queryClient.invalidateQueries({
        queryKey: ['messages', vars.data.chatid],
      }),
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

export function useEditMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data) => {
      return editMessage(data)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['messages'] }),
    onError: () => {
      console.log('Problem??')
    },
  })
}
