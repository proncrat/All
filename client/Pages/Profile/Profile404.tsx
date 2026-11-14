import { Link, useNavigate, useParams } from 'react-router'
import { UserX } from 'lucide-react'

export function ProfileLost() {
  const { id } = useParams()
  const navigate = useNavigate()

  return (
    <div className="mx-auto w-full max-w-5xl rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      {/* Banner (static skeleton, echoes the loading state) */}
      <div className="h-40 w-full rounded-lg bg-zinc-800 md:h-64" />

      <div className="mt-4 flex flex-col gap-4 sm:flex-row">
        {/* Avatar with icon */}
        <div className="flex size-32 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-zinc-500 md:size-40">
          <UserX className="size-12" strokeWidth={1.5} />
        </div>

        {/* Message */}
        <div className="flex flex-col justify-center gap-2">
          <h1 className="text-2xl font-semibold">Profile not found</h1>
          <p className="max-w-md text-sm text-zinc-400">
            We couldn't find a profile
            {id ? (
              <>
                {' '}
                for <span className="text-zinc-200 break-all">{id}</span>
              </>
            ) : null}
            . It may have been removed, renamed, or the link might be wrong.
          </p>

          <div className="mt-2 flex flex-wrap gap-3">
            <Link
              to="/"
              className="rounded-full border border-[rgba(255,255,255,0.47)] bg-[rgba(255,255,255,0.09)] px-4 py-1.5 text-xs font-semibold backdrop-blur-[2.5px] transition-colors hover:bg-[rgba(255,255,255,0.16)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
            >
              Go home
            </Link>
            <button
              onClick={() => navigate(-1)}
              className="cursor-pointer rounded-full border border-zinc-700 px-4 py-1.5 text-xs font-semibold text-zinc-400 transition-colors hover:text-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
            >
              Go back
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
