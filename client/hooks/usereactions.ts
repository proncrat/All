import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getLibrary,
  getProfileReposts,
  getMyReactions,
  getReactions,
  setFlag,
  setVote,
  type ReactionSummary,
  type ReactionTarget,
  type Vote,
} from '../apis/reactionsapi'

type Action =
  | { kind: 'vote'; vote: Vote | null }
  | { kind: 'save' | 'repost'; active: boolean }

/** Applies an action to a summary locally, for instant feedback. */
function applyAction(s: ReactionSummary, a: Action): ReactionSummary {
  if (a.kind === 'vote') {
    const next = { ...s, vote: a.vote }
    if (s.vote === 'like') next.likes--
    if (s.vote === 'dislike') next.dislikes--
    if (a.vote === 'like') next.likes++
    if (a.vote === 'dislike') next.dislikes++
    return next
  }
  if (a.kind === 'save') {
    if (s.saved === a.active) return s
    return { ...s, saved: a.active, saves: s.saves + (a.active ? 1 : -1) }
  }
  if (s.reposted === a.active) return s
  return {
    ...s,
    reposted: a.active,
    reposts: s.reposts + (a.active ? 1 : -1),
  }
}

export function useReactions(
  type: ReactionTarget,
  id: string | number | undefined | null,
) {
  const queryClient = useQueryClient()
  const queryKey = ['reactions', type, String(id)]

  const query = useQuery({
    queryKey,
    queryFn: () => getReactions(type, id!),
    enabled: id != null && id !== '',
  })

  const mutation = useMutation({
    mutationFn: (a: Action) =>
      a.kind === 'vote'
        ? setVote(type, id!, a.vote)
        : setFlag(type, id!, a.kind, a.active),

    // Optimistic update; rolled back on error
    onMutate: async (a) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<ReactionSummary>(queryKey)
      if (previous) queryClient.setQueryData(queryKey, applyAction(previous, a))
      return { previous }
    },
    onError: (_err, _a, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(queryKey, ctx.previous)
    },
    onSuccess: (summary) => {
      queryClient.setQueryData(queryKey, summary)
      queryClient.invalidateQueries({ queryKey: ['myReactions'] })
      queryClient.invalidateQueries({ queryKey: ['library'] })
      queryClient.invalidateQueries({ queryKey: ['profileReposts'] })
    },
  })

  return { ...query, act: mutation.mutate, isSaving: mutation.isPending }
}

/** The signed-in user's saved / reposted / liked items. */
export function useMyReactions(
  kind: Vote | 'save' | 'repost',
  type?: ReactionTarget,
) {
  return useQuery({
    queryKey: ['myReactions', kind, type ?? 'all'],
    queryFn: () => getMyReactions(kind, type),
  })
}

/** Liked, disliked, saved and reposted items with card details. */
export function useLibrary(enabled = true) {
  return useQuery({
    queryKey: ['library'],
    queryFn: getLibrary,
    enabled,
  })
}

/** A profile's reposts (public), optionally one content type. */
export function useProfileReposts(
  profileId: string | undefined,
  type?: ReactionTarget,
) {
  return useQuery({
    queryKey: ['profileReposts', profileId, type ?? 'all'],
    queryFn: () => getProfileReposts(profileId!, type),
    enabled: !!profileId,
  })
}
