import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createAlbum,
  deleteAlbum,
  getAlbum,
  getUserAlbums,
  setAlbumTracks,
  updateAlbum,
  type Album,
  type AlbumInput,
} from '../apis/albumsapi'

/** Every album query starts with 'albums', so one invalidation covers all. */
const KEY = 'albums'

/** A user's albums, newest release first. */
export function useUserAlbums(profileId: string | number | undefined) {
  return useQuery({
    queryKey: [KEY, 'user', String(profileId)],
    queryFn: () => getUserAlbums(profileId!),
    enabled: profileId != null && profileId !== '',
  })
}

export function useAlbum(id: string | number | undefined) {
  return useQuery({
    queryKey: [KEY, 'one', String(id)],
    queryFn: () => getAlbum(id!),
    enabled: id != null && id !== '',
    retry: false,
  })
}

/** Create, edit, delete and set tracks. All refresh album and song queries. */
export function useAlbumMutations() {
  const queryClient = useQueryClient()
  const refresh = (album?: Album) => {
    if (album) queryClient.setQueryData([KEY, 'one', String(album.id)], album)
    return Promise.all([
      queryClient.invalidateQueries({ queryKey: [KEY] }),
      // Songs tab shows album names and covers
      queryClient.invalidateQueries({ queryKey: ['profileAll'] }),
    ])
  }

  const create = useMutation({
    mutationFn: (data: AlbumInput) => createAlbum(data),
    onSuccess: refresh,
  })
  const update = useMutation({
    mutationFn: ({ id, data }: { id: number; data: AlbumInput }) =>
      updateAlbum(id, data),
    onSuccess: refresh,
  })
  const remove = useMutation({
    mutationFn: (id: number) => deleteAlbum(id),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: [KEY, 'one', String(id)] })
      return refresh()
    },
  })
  const setTracks = useMutation({
    mutationFn: ({ id, songIds }: { id: number; songIds: number[] }) =>
      setAlbumTracks(id, songIds),
    onSuccess: refresh,
  })

  return { create, update, remove, setTracks }
}
