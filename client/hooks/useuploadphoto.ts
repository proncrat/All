import { useMutation, useQueryClient } from '@tanstack/react-query'
import { sendPhoto } from '../apis/photouploadapi'

export function useAddPhoto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data) => {
      return sendPhoto(data)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['photos'] }),
  })
}
