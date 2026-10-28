import { useUserData } from '@/client/hooks'
import { useParams } from 'react-router'
import { Lightbox } from '../util/Lightbok'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useInfiniteScroll } from '../util/Infinitebok'

//really should fully flesh out db and the types lol
type Photo = {
  id: string | number
  url: string
  thumburl: string
  describe?: string
  // who posted it
  handle?: string
  avatar?: string
  date?: string
  // optional reaction data from your API
  likes?: number
  dislikes?: number
  vote?: 'like' | 'dislike' | null
  reposts?: number
  saves?: number
  reposted?: boolean
  saved?: boolean
}

const GRID_CLASS =
  'grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] my-3 mx-4 overflow-hidden rounded-xl'

function PhotosSkeleton({ count = 6 }: { count?: number }) {
  return (
    <ul className={GRID_CLASS} aria-busy="true" aria-label="Loading photos">
      {Array.from({ length: count }, (_, i) => (
        <li
          key={i}
          className="aspect-square bg-muted shimmer shimmer-bg shimmer-color-neutral-600 shimmer-duration-1500"
        />
      ))}
    </ul>
  )
}

const PAGE_SIZE = 10

/**
 * Replaces `useUserData(id, 'photos')` for this page.
 * ADAPT: the URL and response shape to your API. It must return one page of
 * Photo[] per request. If useUserData already has a fetcher, reuse it here.
 */
function useUserPhotosInfinite(id: string | undefined) {
  return useInfiniteQuery({
    queryKey: ['userData', id, 'photos'],
    queryFn: async ({ pageParam }) => {
      if (!id) throw new Error('ID is required') // Guard against undefined id

      const qs = new URLSearchParams({ limit: '6' })
      if (pageParam) qs.set('cursor', pageParam)

      const res = await fetch(`/api/v1/photo/improv/${id}?${qs}`)
      if (!res.ok) throw new Error('Could not load photos')

      return res.json() as Promise<{
        items: Photo[]
        nextCursor: string | null
      }>
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    enabled: !!id,
  })
}

export function Photos() {
  const { id } = useParams()
  const {
    data,
    isPending,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
  } = useUserPhotosInfinite(id)

  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const close = useCallback(() => setActiveIndex(null), [])

  // Flatten pages into one array, so the grid and Lightbox work as before
  const photos = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  )
  // Auto-load only when more exists, nothing is in flight, and the last
  // attempt didn't fail (avoids a retry loop on a broken endpoint)
  const canLoadMore =
    !!hasNextPage && !isFetchingNextPage && !isFetchNextPageError
  const sentinelRef = useInfiniteScroll(() => fetchNextPage(), {
    enabled: canLoadMore,
  })

  // Lightbox: when the user gets near the last loaded photo, fetch the next
  // page so the "next" arrow keeps working
  useEffect(() => {
    if (
      activeIndex !== null &&
      activeIndex >= photos.length - 3 &&
      canLoadMore
    ) {
      fetchNextPage()
    }
  }, [activeIndex, photos.length, canLoadMore, fetchNextPage])

  // Lightbox: close if the open photo disappears (e.g. it was just deleted)
  useEffect(() => {
    if (activeIndex !== null && activeIndex >= photos.length) close()
  }, [activeIndex, photos.length, close])

  if (isPending) return <PhotosSkeleton />
  if (isError) return <div>Error: {error.message}</div>
  if (photos.length === 0) return <div>True adam error (No photos)</div>

  return (
    <>
      <ul className={GRID_CLASS}>
        {photos.map((item, i) => (
          <li
            key={item.id}
            onClick={() => setActiveIndex(i)}
            className="group aspect-square cursor-zoom-in overflow-hidden bg-white/5"
          >
            <img
              src={item.thumburl}
              alt={item.describe}
              loading="lazy"
              className="block h-full w-full object-cover transition duration-300 group-hover:scale-105 group-hover:brightness-110"
            />
          </li>
        ))}
      </ul>

      {/* Sentinel: when this scrolls into view, the next page loads */}
      <div ref={sentinelRef} style={{ height: 1 }} />

      {isFetchingNextPage && (
        <p
          className="py-6 text-center text-sm text-white/50"
          aria-live="polite"
        >
          Loading more…
        </p>
      )}

      {isFetchNextPageError && (
        /*
                  <button
                    type="button"
                    onClick={() => fetchNextPage()}
                    className="mx-auto block py-6 text-sm text-white/70 underline"
                  >
          */
        <p>Could not load more. Try again.</p>
        //</></button>
      )}

      {activeIndex !== null && photos[activeIndex] && (
        <Lightbox
          photos={photos}
          index={activeIndex}
          onIndexChange={setActiveIndex}
          onClose={close}
        />
      )}
    </>
  )
}
