import { useMutation, useQueryClient } from '@tanstack/react-query'
import { addFollow } from '../apis/followclient'

export function useAddFollow() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data) => {
      return addFollow(data)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['follows'] }),
  })
}
