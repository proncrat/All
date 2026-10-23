import { Link } from 'react-router'

export function VideoCard({ data }) {
  return (
    <Link to={`/video/${data.id}`} className="group block text-inherit">
      <article className="h-full overflow-hidden rounded-xl border border-white/20 bg-white/5 transition duration-200 group-hover:-translate-y-0.5 group-hover:border-white/40 group-hover:bg-white/10">
        <img
          src={data.thumbnail_link}
          alt={data.name}
          loading="lazy"
          className="aspect-video w-full object-cover"
        />

        <div className="flex flex-col gap-0.5 p-3">
          <h3
            className="line-clamp-2 font-medium leading-snug"
            title={data.name}
          >
            {data.name}
          </h3>

          {data.author && (
            <p className="truncate text-sm opacity-80">{data.author}</p>
          )}

          <p className="text-xs opacity-60">
            {Number(data.views).toLocaleString()} views ·{' '}
            {new Date(data.post_date).toLocaleDateString()}
          </p>
        </div>
      </article>
    </Link>
  )
}
