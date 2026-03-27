import { MutationFunction, useQuery } from '@tanstack/react-query'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import * as API from './api.ts'

export function useProfileAll() {
  const query = useQuery({
    queryKey: ['profileAll'],
    queryFn: () => API.getUsers(),
  })

  return {
    ...query,
  }
}

export function useProfile(id: string) {
  const query = useQuery({
    queryKey: ['profile', id],
    queryFn: () => API.getUserById(id),
  })

  return {
    ...query,
  }
}

export function usePhotos(id: string) {
  const query = useQuery({
    queryKey: ['photos', id],
    queryFn: () => API.getPhotosByUser(id),
  })

  return {
    ...query,
  }
}

export function useVideos(id: string) {
  const query = useQuery({
    queryKey: ['videos', id],
    queryFn: () => API.getVideosByUser(id),
  })

  return {
    ...query,
  }
}

export function usePosts(id: string) {
  const query = useQuery({
    queryKey: ['posts', id],
    queryFn: () => API.getPostsByUser(id),
  })

  return {
    ...query,
  }
}

export function useSongs(id: string) {
  const query = useQuery({
    queryKey: ['songs', id],
    queryFn: () => API.getSongsByUser(id),
  })

  return {
    ...query,
  }
}

//Video

export function useVideo(id: string) {
  const query = useQuery({
    queryKey: ['video', id],
    queryFn: () => API.getVideosById(id),
  })

  return {
    ...query,
  }
}

export function useFruitMutation<TData = unknown, TVariables = unknown>(
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
  return useFruitMutation(API.updateFruit)
}

export function useDeleteFruit() {
  return useFruitMutation(API.deleteFruit)
}

export function useAddFruit() {
  return useFruitMutation(API.addFruit)
}
