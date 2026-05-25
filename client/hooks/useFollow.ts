import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  addFollow,
  getfollowers,
  getfollowing,
  removeFollow,
} from '../apis/followclient'

export function useAddFollow() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data) => {
      return addFollow(data)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['follow'] }),
  })
}

export function useDeleteFollow() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data) => {
      return removeFollow(data)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['follow'] }),
  })
}

export function useGetFollowing(id, enable = true) {
  const query = useQuery({
    queryKey: ['follow', 'following'],
    queryFn: () => getfollowing(id),
    enabled: enable,
  })

  return {
    ...query,
  }
}

export function useGetFollower(id, enable = true) {
  const query = useQuery({
    queryKey: ['follow', 'followers'],
    queryFn: () => getfollowers(id),
    enabled: enable,
  })

  return {
    ...query,
  }
}
