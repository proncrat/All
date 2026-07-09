import { useMutation, useQueryClient } from '@tanstack/react-query'
import { addComment, deleteComment } from '../apis/commentsapi'

export function useAddComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data) => {
      return addComment(data)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['comments'] }),
  })
}

export function useDeleteComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data) => {
      return deleteComment(data)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['comments'] }),
  })
}
