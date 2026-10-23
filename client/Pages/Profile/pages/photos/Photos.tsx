import { useUserData } from '@/client/hooks'
import { useEffect, useRef } from 'react'
import { useParams } from 'react-router'
import Viewer from 'viewerjs'
import 'viewerjs/dist/viewer.css'

export function Photos() {
  const { id } = useParams()
  const { data, isPending, isError, error } = useUserData(id, 'photos')
  const listRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    const el = listRef.current
    if (!el || !data || data.length === 0) return

    const viewer = new Viewer(el, {
      url: 'data-original', // full-size image comes from this attribute
      title: [1, (image) => image.alt],
      navbar: false, // hide the bottom thumbnail strip
      transition: true,
      toolbar: {
        zoomIn: 1,
        zoomOut: 1,
        oneToOne: 1,
        reset: 1,
        prev: 1,
        next: 1,
        rotateLeft: 0,
        rotateRight: 0,
        flipHorizontal: 0,
        flipVertical: 0,
      },
    })

    // Destroy on cleanup so the gallery rebuilds whenever `data` changes
    return () => viewer.destroy()
  }, [data])

  if (isPending) return <div>Loading...</div>
  if (isError) return <div>Error: {error.message}</div>
  if (data.length === 0) return <div>True adam error (No photos)</div>

  return (
    <ul
      ref={listRef}
      className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-2.5 py-3 px-4"
    >
      {data.map((item) => (
        <li
          key={item.id}
          className="group aspect-square cursor-zoom-in overflow-hidden rounded-xl bg-white/5 sm:[&:nth-child(7n+1)]:col-span-2 sm:[&:nth-child(7n+1)]:row-span-2"
        >
          <img
            data-original={item.url}
            src={item.thumburl}
            alt={item.describe}
            loading="lazy"
            className="block h-full w-full object-cover transition duration-300 group-hover:scale-105 group-hover:brightness-110"
          />
        </li>
      ))}
    </ul>
  )
}
