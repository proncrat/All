import { useQuery } from '@tanstack/react-query'

import * as API from './api.ts'

export function useUserData(id: string, route?: string, enable = true) {
  const query = useQuery({
    queryKey: ['profileAll', id, route],
    queryFn: () => API.getUserData(id, route),
    enabled: enable,
  })

  return {
    ...query,
  }
}

export function useProfileAll() {
  const query = useQuery({
    queryKey: ['profileAll'],
    queryFn: () => API.getUsers(),
  })

  return {
    ...query,
  }
}

export function Usesessionid(linkId: string, thething: boolean) {
  const query = useQuery({
    queryKey: ['match', linkId],
    queryFn: () => API.getprofilematchid(linkId),
    enabled: thething,
  })

  return {
    ...query,
  }
}

//Video

export function useVideo(id: string = '0') {
  const query = useQuery({
    queryKey: ['video', id],
    queryFn: () => API.getVideosById(id),
  })

  return {
    ...query,
  }
}

//coms

export function useMessages(chatId: string) {
  const query = useQuery({
    queryKey: ['messages', chatId],
    queryFn: () => API.getmessagesbyid(chatId),
  })

  return {
    ...query,
  }
}

export function useChats(userId: string, enable = true) {
  const query = useQuery({
    queryKey: ['chats', userId],
    queryFn: () => API.getchatsbyid(userId),
    enabled: enable,
  })

  return {
    ...query,
  }
}

//comments

export function useComments(linkId: string, LinkType: string) {
  const query = useQuery({
    queryKey: ['comments'],
    queryFn: () => API.getCommentsByLinkClient(linkId, LinkType),
  })

  return {
    ...query,
  }
}

/*
export function useCommentMutation<TData = unknown, TVariables = unknown>(
  mutationFn: MutationFunction<TData, TVariables>,
) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fruits'] })
    },
  })

  return mutation
}

export function useUpdateFruit() {
  return useCommentMutation(API.updateFruit)
}

export function useDeleteFruit() {
  return useCommentMutation(API.deleteFruit)
}

export function useAddcommeffnt() {
  return useCommentMutation(API.addComment)
}
*/
