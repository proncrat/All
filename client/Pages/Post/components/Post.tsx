import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { card, field } from './uploadui'

interface NewPostProps {
  user?: { name?: string | null; avatar?: string | null }
  onSubmit?: (post: {
    title: string
    body: string
    files: File[]
  }) => Promise<unknown> | void
}

/**
 * "New post" content area for the /post page (Post tab).
 * Left: live preview of the post as it will appear on a profile.
 * Right: form card (title, text, images), styled like the other upload tabs.
 */
export default function NewPost({
  user = { name: '', avatar: '' },
  onSubmit,
}: NewPostProps) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [dragging, setDragging] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [posted, setPosted] = useState(false)
  const trackRef = useRef<HTMLDivElement>(null)

  const previews = useMemo(
    () => files.map((f) => ({ file: f, url: URL.createObjectURL(f) })),
    [files],
  )
  useEffect(
    () => () => previews.forEach((p) => URL.revokeObjectURL(p.url)),
    [previews],
  )

  // Hide the success message after 3 seconds
  useEffect(() => {
    if (!posted) return
    const t = setTimeout(() => setPosted(false), 3000)
    return () => clearTimeout(t)
  }, [posted])

  const addFiles = (list: FileList | null) => {
    const imgs = Array.from(list ?? []).filter((f) =>
      f.type.startsWith('image/'),
    )
    if (imgs.length) setFiles((prev) => [...prev, ...imgs])
  }
  const removeFile = (i: number) =>
    setFiles((prev) => prev.filter((_, idx) => idx !== i))

  const hasAnything = Boolean(title.trim() || body.trim() || files.length)
  // No backend for posts yet: keep the button disabled until onSubmit is wired
  const canPost = hasAnything && !busy && Boolean(onSubmit)

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!canPost) return
    setBusy(true)
    setError(null)
    setPosted(false)
    try {
      await onSubmit?.({ title: title.trim(), body: body.trim(), files })
      setTitle('')
      setBody('')
      setFiles([])
      setPosted(true)
    } catch {
      setError('Posting failed. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const scrollNext = () => {
    const el = trackRef.current
    if (el) el.scrollBy({ left: el.clientWidth * 0.7, behavior: 'smooth' })
  }

  const today = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 py-4 sm:py-8 lg:flex-row lg:items-start lg:justify-center">
      {/* Preview */}
      <section
        aria-label="Post preview"
        className="flex min-h-[24rem] min-w-0 flex-1 items-start overflow-hidden rounded-2xl border border-white/20 bg-black p-4 sm:p-6"
      >
        {!hasAnything ? (
          <p className="m-auto text-sm text-white/40">
            Your post preview will appear here
          </p>
        ) : (
          <article className="w-full rounded-xl border border-white/20 bg-neutral-900 p-4">
            <header className="mb-4 flex items-center gap-3">
              <div className="h-12 w-12 flex-none overflow-hidden rounded-full bg-white/10">
                {user.avatar && (
                  <img
                    src={user.avatar}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div>
                <div className="text-sm font-semibold">@{user.name}</div>
                <div className="text-xs text-white/50">{today}</div>
              </div>
            </header>

            {(title.trim() || body.trim()) && (
              <div className="mb-4 rounded-lg bg-white/5 px-4 py-3">
                {title.trim() && (
                  <h3 className="mb-1 text-lg font-semibold">{title}</h3>
                )}
                {body.trim() && (
                  <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                    {body}
                  </p>
                )}
              </div>
            )}

            {previews.length > 0 && (
              <div className="relative">
                <div
                  ref={trackRef}
                  className="flex snap-x snap-mandatory gap-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                  {previews.map((p) => (
                    <img
                      key={p.url}
                      src={p.url}
                      alt=""
                      className="h-72 w-auto max-w-full flex-none snap-start rounded-lg bg-white/5 object-cover lg:h-96"
                    />
                  ))}
                </div>
                {previews.length > 1 && (
                  <button
                    type="button"
                    onClick={scrollNext}
                    aria-label="Next image"
                    className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 cursor-pointer place-items-center rounded-full border border-white/30 bg-black/70 text-white hover:border-white"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9 6l6 6-6 6" />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </article>
        )}
      </section>

      {/* Form */}
      <form onSubmit={submit} className={card}>
        <h1 className="text-xl font-semibold">New post</h1>

        <div className="space-y-1.5">
          <label htmlFor="np-title" className="text-sm font-medium">
            Title
          </label>
          <input
            id="np-title"
            type="text"
            autoComplete="off"
            maxLength={120}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Give it a title"
            className={field}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="np-body" className="text-sm font-medium">
            Text
          </label>
          <textarea
            id="np-body"
            rows={4}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="What's on your mind?"
            className={`${field} resize-none`}
          />
        </div>

        <div className="space-y-1.5">
          <span className="text-sm font-medium">Images</span>
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragging(false)
              addFiles(e.dataTransfer.files)
            }}
            className={`relative flex h-28 w-full items-center justify-center overflow-hidden rounded-xl
              border border-dashed transition-colors hover:border-white
              ${dragging ? 'border-white bg-white/5' : 'border-white/30'}`}
          >
            <div className="pointer-events-none px-4 text-center">
              <p className="text-sm font-medium">Tap to add photos</p>
              <p className="mt-1 text-xs text-white/50">
                or drag and drop them here
              </p>
            </div>
            <input
              type="file"
              accept="image/*"
              multiple
              aria-label="Add photos"
              onChange={(e) => {
                addFiles(e.target.files)
                e.target.value = ''
              }}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
          </div>

          {previews.length > 0 && (
            <ul className="flex flex-wrap gap-2 pt-2">
              {previews.map((p, i) => (
                <li key={p.url} className="relative h-16 w-16">
                  <img
                    src={p.url}
                    alt=""
                    className="h-full w-full rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    aria-label={`Remove image ${i + 1}`}
                    className="absolute -right-1.5 -top-1.5 grid h-5 w-5 cursor-pointer place-items-center rounded-full border border-white/30 bg-black text-sm leading-none text-white hover:border-white"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          type="submit"
          disabled={!canPost}
          className="min-h-11 w-full cursor-pointer rounded-lg bg-white px-5 text-sm font-semibold text-black
            transition-colors hover:bg-white/85 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? 'Posting…' : 'Post'}
        </button>

        {!onSubmit && (
          <p className="text-xs text-white/40">
            Posting isn&apos;t connected yet.
          </p>
        )}

        {posted && (
          <p role="status" className="text-sm text-green-400">
            Post published!
          </p>
        )}

        {error && (
          <p role="alert" className="text-sm text-red-400">
            {error}
          </p>
        )}
      </form>
    </div>
  )
}
