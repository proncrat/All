import { Link, useParams } from 'react-router'
import { useUserData } from '@/client/hooks'
import { Spinner } from '@/client/Pages/Util/SpinnerBox'
import type { videos } from '@/client/models/video'

/** Profile "Videos → Shorts" tab: a grid of vertical (9:16) cards. */
export function Shorts() {
  const { id } = useParams()
  const { data, isPending, isError, error } = useUserData(id ?? '', 'shorts')

  if (isPending) return <Spinner />

  if (isError) {
    return <div className="p-4">Error: {error.message}</div>
  }

  if (!Array.isArray(data) || data.length === 0) {
    return <div className="p-8 text-center opacity-70">No shorts yet</div>
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3 p-4">
      {data.map((short: videos) => (
        <ShortCard key={short.id} data={short} />
      ))}
    </div>
  )
}

function ShortCard({ data }: { data: videos }) {
  return (
    <Link to={`/shortz/${data.id}`} className="group block text-inherit">
      <article className="relative aspect-[9/16] overflow-hidden rounded-xl border border-white/20 bg-black transition duration-200 group-hover:-translate-y-0.5 group-hover:border-white/40">
        {data.thumbnail_link ? (
          <img
            src={data.thumbnail_link}
            alt={data.name}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <video
            src={data.video_link}
            preload="metadata"
            muted
            playsInline
            className="h-full w-full object-cover"
          />
        )}

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 pt-10">
          <h3
            className="line-clamp-2 text-sm font-medium leading-snug"
            title={data.name}
          >
            {data.name}
          </h3>
          <p className="mt-0.5 text-xs opacity-70">
            {Number(data.views ?? 0).toLocaleString()} views
          </p>
        </div>
      </article>
    </Link>
  )
}
