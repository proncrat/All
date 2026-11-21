import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router'
import { Lightbox } from '../util/Lightbok'

import { useCallback, useEffect, useMemo } from 'react'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { useInfiniteScroll } from '../util/Infinitebok'
import { Spinner } from '@/client/Pages/Util/SpinnerBox'

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

const PAGE_SIZE = 10

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

function useSinglePhoto(photoId: string | null) {
  return useQuery({
    queryKey: ['photo', photoId],
    queryFn: async () => {
      const res = await fetch(
        `/api/v1/photo/single/${encodeURIComponent(photoId!)}`,
      )
      if (!res.ok) throw new Error('Photo not found')
      return res.json() as Promise<Photo>
    },
    enabled: photoId != null,
    retry: false,
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

  // Flatten pages into one array, so the grid and Lightbox work as before
  const photos = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  )

  // Lightbox state lives in the URL (?photo=<id>) so photos can be linked to
  // directly and the back button closes the lightbox.
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const photoParam = searchParams.get('photo')
  const openedFromGrid = Boolean(
    (location.state as { lightbox?: boolean } | null)?.lightbox,
  )

  const listIndex = photoParam
    ? photos.findIndex((p) => String(p.id) === photoParam)
    : -1
  const activeIndex = listIndex === -1 ? null : listIndex

  // A linked photo that isn't in the loaded pages (yet) is fetched on its own
  const single = useSinglePhoto(
    photoParam && !isPending && listIndex === -1 ? photoParam : null,
  )

  const setPhotoParam = useCallback(
    (photoId: string | number | null, opts: { replace: boolean }) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (photoId == null) next.delete('photo')
          else next.set('photo', String(photoId))
          return next
        },
        {
          replace: opts.replace,
          preventScrollReset: true,
          // remember the lightbox was opened from the grid, so closing can go back
          state:
            photoId == null
              ? null
              : { lightbox: opts.replace ? openedFromGrid : true },
        },
      )
    },
    [setSearchParams, openedFromGrid],
  )

  const open = (i: number) => setPhotoParam(photos[i].id, { replace: false })
  const setActiveIndex = (i: number) =>
    photos[i] && setPhotoParam(photos[i].id, { replace: true })
  const close = useCallback(() => {
    if (openedFromGrid) navigate(-1)
    else setPhotoParam(null, { replace: true })
  }, [openedFromGrid, navigate, setPhotoParam])
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

  // Lightbox: close if the linked photo doesn't exist (bad link, or deleted)
  useEffect(() => {
    if (photoParam && single.isError) close()
  }, [photoParam, single.isError, close])

  const lightboxPhotos =
    activeIndex !== null ? photos : single.data ? [single.data] : null

  if (isPending) return <Spinner />
  if (isError) return <div>Error: {error.message}</div>
  if (photos.length === 0) return <div>True adam error (No photos)</div>

  return (
    <>
      <ul className={GRID_CLASS}>
        {photos.map((item, i) => (
          <li
            key={item.id}
            onClick={() => open(i)}
            className="group aspect-square cursor-pointer overflow-hidden bg-white/5 hover:shadow-2xl shadow-black transition-shadow duration-300 hover:z-20"
          >
            <img
              src={item.thumburl}
              alt={item.describe}
              loading="lazy"
              className="block h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
          </li>
        ))}
      </ul>

      {/* Sentinel: when this scrolls into view, the next page loads */}
      <div ref={sentinelRef} style={{ height: 1 }} />

      {isFetchingNextPage && <Spinner />}

      {isFetchNextPageError && <p>Could not load more.</p>}

      {lightboxPhotos && (
        <Lightbox
          photos={lightboxPhotos}
          index={activeIndex ?? 0}
          onIndexChange={setActiveIndex}
          onClose={close}
        />
      )}
    </>
  )
}
