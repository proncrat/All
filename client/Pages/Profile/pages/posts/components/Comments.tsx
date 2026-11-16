export function CommentList({ comments, single }) {
  return (
    <ul
      className={single ? 'space-y-4' : 'flex-1 space-y-4 overflow-y-auto pr-1'}
    >
      {comments.length === 0 && (
        <li className="text-sm text-neutral-500">No comments yet.</li>
      )}
      {comments.map((c) => {
        const cd = new Date(c.post_date)
        return (
          <li key={c.id} className="flex gap-2">
            {c.pfp ? (
              <img
                src={c.pfp}
                alt=""
                className="h-8 w-8 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold uppercase">
                {c.name?.[0] ?? '?'}
              </div>
            )}
            <div className="min-w-0 text-sm">
              <div>
                <span className="font-semibold">@{c.name}</span>{' '}
                <time
                  dateTime={cd.toISOString()}
                  className="text-xs text-neutral-500"
                >
                  {cd.toLocaleDateString()}{' '}
                  {cd.toLocaleTimeString(undefined, {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </time>
              </div>
              <p className="whitespace-pre-line break-words text-neutral-200">
                {c.body_text}
              </p>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
