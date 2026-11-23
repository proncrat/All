import { useQuery } from '@tanstack/react-query'
import { getPost } from '../apis/postapi'

export function usePost(id: string | undefined) {
  return useQuery({
    queryKey: ['post', id],
    queryFn: () => getPost(id!),
    enabled: Boolean(id),
  })
}
