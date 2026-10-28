import { useCallback, useEffect, useRef } from 'react'
import { useInfiniteQuery, type QueryKey } from '@tanstack/react-query'

/**
 * useInfiniteScroll
 * Returns a ref callback for a "sentinel" element at the bottom of the list.
 * When it scrolls into view, `onLoadMore` is called.
 *
 * Tip: set `enabled` to false while a fetch is in flight. The observer is
 * then re-created when it flips back to true, and a new observer always
 * reports the sentinel's current state. That means the next page still
 * loads if a short page leaves the sentinel on screen.
 */
export function useInfiniteScroll(
  onLoadMore: () => void,
  { enabled = true, rootMargin = '300px' } = {},
) {
  const loadRef = useRef(onLoadMore)
  loadRef.current = onLoadMore

  const observerRef = useRef<IntersectionObserver | null>(null)

  const sentinelRef = useCallback(
    (node: HTMLElement | null) => {
      observerRef.current?.disconnect()
      observerRef.current = null
      if (!node || !enabled) return

      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) loadRef.current()
        },
        { rootMargin },
      )
      observerRef.current.observe(node)
    },
    [enabled, rootMargin],
  )

  useEffect(() => () => observerRef.current?.disconnect(), [])

  return sentinelRef
}

/**
 * InfiniteList
 * `fetchPage(page)` returns the items for a 0-based page number.
 * A page with fewer than `pageSize` items is treated as the last one.
 */
export function InfiniteList<T extends { id: string | number }>({
  queryKey,
  fetchPage,
  renderItem,
  pageSize = 20,
}: {
  queryKey: QueryKey
  fetchPage: (page: number) => Promise<T[]>
  renderItem: (item: T) => React.ReactNode
  pageSize?: number
}) {
  const {
    data,
    status,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
  } = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => fetchPage(pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      lastPage.length < pageSize ? undefined : lastPageParam + 1,
  })

  // Auto-load only when there's more, nothing is in flight, and the last
  // attempt didn't fail (otherwise a failing request would retry in a loop).
  const sentinelRef = useInfiniteScroll(() => fetchNextPage(), {
    enabled:
      status === 'success' &&
      hasNextPage &&
      !isFetchingNextPage &&
      !isFetchNextPageError,
  })

  if (status === 'pending') return <p aria-live="polite">Loading…</p>

  if (status === 'error') {
    return (
      <button type="button" onClick={() => refetch()}>
        Could not load. Try again.
      </button>
    )
  }

  const items = data.pages.flat()

  return (
    <div>
      {items.map((item) => (
        <div key={item.id}>{renderItem(item)}</div>
      ))}

      {isFetchingNextPage && <p aria-live="polite">Loading more…</p>}

      {isFetchNextPageError && (
        <button type="button" onClick={() => fetchNextPage()}>
          Could not load more. Try again.
        </button>
      )}

      {!hasNextPage && items.length > 0 && <p>You've reached the end.</p>}

      {/* Sentinel: when this scrolls into view, the next page loads */}
      <div ref={sentinelRef} style={{ height: 1 }} />
    </div>
  )
}

/* Usage (needs a <QueryClientProvider> higher up the tree)

<InfiniteList<Photo>
  queryKey={['photos']}
  fetchPage={(page) =>
    fetch(`/api/photos?page=${page}&limit=20`).then((r) => {
      if (!r.ok) throw new Error('Request failed') // so errors reach the query
      return r.json()
    })
  }
  renderItem={(photo) => <img src={photo.url} alt={photo.describe} />}
/>

// Refresh the list after your delete mutation in the lightbox:
// const qc = useQueryClient()
// useMutation({ ..., onSuccess: () => qc.invalidateQueries({ queryKey: ['photos'] }) })
//
// If your API returns a cursor instead of page numbers, set
// initialPageParam to undefined and make getNextPageParam return
// lastPage.nextCursor (or undefined on the last page).
*/
