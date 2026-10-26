import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deletePhoto, sendPhoto } from '../apis/photouploadapi'

export function useAddPhoto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data) => {
      return sendPhoto(data)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['photos'] }),
  })
}

export function useDeletePhoto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id) => {
      return await deletePhoto(id)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['photos'] }),
  })
}
