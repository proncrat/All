import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { uploadPost, uploadSong, uploadVideo } from '../apis/mediauploadapi'

/** Mutation wrapper that also tracks upload progress (0-100). */
function useUpload<T>(
  fn: (data: FormData, onProgress: (p: number) => void) => Promise<T>,
) {
  const queryClient = useQueryClient()
  const [progress, setProgress] = useState(0)

  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      setProgress(0)
      return fn(data, setProgress)
    },
    // Profile tabs (videos / songs) are fetched under 'profileAll'; songs can
    // also be uploaded into an album
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['profileAll'] }),
        queryClient.invalidateQueries({ queryKey: ['albums'] }),
      ]),
  })

  return { ...mutation, progress }
}

export function useUploadVideo() {
  return useUpload(uploadVideo)
}

export function useUploadSong() {
  return useUpload(uploadSong)
}

export function useUploadPost() {
  return useUpload(uploadPost)
}
