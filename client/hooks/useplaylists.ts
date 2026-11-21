import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  addToPlaylist,
  createPlaylist,
  deletePlaylist,
  getMyPlaylists,
  getPlaylist,
  getPlaylistsContaining,
  getUserPlaylists,
  removeFromPlaylist,
  updatePlaylist,
  type NewPlaylist,
  type Playlist,
  type PlaylistChanges,
  type PlaylistTarget,
} from '../apis/playlistsapi'

/** Every playlist query starts with 'playlists', so one invalidation covers all. */
const KEY = 'playlists'

/** The signed-in user's playlists, optionally of one type. */
export function useMyPlaylists(type?: PlaylistTarget, enabled = true) {
  return useQuery({
    queryKey: [KEY, 'me', type ?? 'all'],
    queryFn: () => getMyPlaylists(type),
    enabled,
  })
}

/** A user's playlists as shown on their profile. */
export function useUserPlaylists(profileId: string | number | undefined) {
  return useQuery({
    queryKey: [KEY, 'user', String(profileId)],
    queryFn: () => getUserPlaylists(profileId!),
    enabled: profileId != null && profileId !== '',
  })
}

export function usePlaylist(id: string | number | undefined) {
  return useQuery({
    queryKey: [KEY, 'one', String(id)],
    queryFn: () => getPlaylist(id!),
    enabled: id != null && id !== '',
    retry: false,
  })
}

/** Ids of the signed-in user's playlists that contain an item. */
export function usePlaylistsContaining(
  type: PlaylistTarget,
  targetId: string | number | undefined | null,
  enabled = true,
) {
  return useQuery({
    queryKey: [KEY, 'containing', type, String(targetId)],
    queryFn: () => getPlaylistsContaining(type, targetId!),
    enabled: enabled && targetId != null && targetId !== '',
  })
}

/** Create, edit, delete and add/remove items. All refresh playlist queries. */
export function usePlaylistMutations() {
  const queryClient = useQueryClient()
  const refresh = (playlist?: Playlist) => {
    if (playlist)
      queryClient.setQueryData([KEY, 'one', String(playlist.id)], playlist)
    return queryClient.invalidateQueries({ queryKey: [KEY] })
  }

  const create = useMutation({
    mutationFn: (data: NewPlaylist) => createPlaylist(data),
    onSuccess: refresh,
  })
  const update = useMutation({
    mutationFn: ({ id, changes }: { id: number; changes: PlaylistChanges }) =>
      updatePlaylist(id, changes),
    onSuccess: refresh,
  })
  const remove = useMutation({
    mutationFn: (id: number) => deletePlaylist(id),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: [KEY, 'one', String(id)] })
      return refresh()
    },
  })
  const toggleItem = useMutation({
    mutationFn: ({
      id,
      targetId,
      add,
    }: {
      id: number
      targetId: string | number
      add: boolean
    }) =>
      add ? addToPlaylist(id, targetId) : removeFromPlaylist(id, targetId),
    onSuccess: refresh,
  })

  return { create, update, remove, toggleItem }
}
