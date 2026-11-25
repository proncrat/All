import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  addComment,
  deleteComment,
  voteComment,
  type NewComment,
} from '../apis/commentsapi'
import type { Vote } from '../apis/reactionsapi'
import type { comment } from '../models/comment'

export function useAddComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: NewComment) => addComment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] })
      queryClient.invalidateQueries({ queryKey: ['reactions'] })
    },
  })
}

export function useDeleteComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => deleteComment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] })
      queryClient.invalidateQueries({ queryKey: ['reactions'] })
    },
  })
}

/** Like / dislike / clear a vote on a comment, updated optimistically. */
export function useVoteComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, vote }: { id: number; vote: Vote | null }) =>
      voteComment(id, vote),

    onMutate: async ({ id, vote }) => {
      await queryClient.cancelQueries({ queryKey: ['comments'] })
      const previous = queryClient.getQueriesData<comment[]>({
        queryKey: ['comments'],
      })
      queryClient.setQueriesData<comment[]>({ queryKey: ['comments'] }, (old) =>
        Array.isArray(old)
          ? old.map((c) => {
              if (c.id !== id) return c
              const next = { ...c, vote }
              if (c.vote === 'like') next.likes--
              if (c.vote === 'dislike') next.dislikes--
              if (vote === 'like') next.likes++
              if (vote === 'dislike') next.dislikes++
              return next
            })
          : old,
      )
      return { previous }
    },
    onError: (_err, _vars, ctx) => {
      ctx?.previous.forEach(([key, data]) => queryClient.setQueryData(key, data))
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['comments'] }),
  })
}
