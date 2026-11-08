import { useEffect, useMemo, useRef, useState } from 'react'

/**
 * "New post" content area for the /post page (Post tab) — Tailwind version.
 * Left: live preview of the post as it will appear on a profile.
 * Right: form card (title, text, images).
 *
 * Props:
 *   user     { name: "God", avatar: "/avatar.png" }
 *   onSubmit ({ title, body, files }) => Promise|void
 */
export default function NewPost({ user = { name: '', avatar: '' }, onSubmit }) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [files, setFiles] = useState([])
  const [dragging, setDragging] = useState(false)
  const [busy, setBusy] = useState(false)
  const inputRef = useRef(null)
  const trackRef = useRef(null)

  const previews = useMemo(
    () => files.map((f) => ({ file: f, url: URL.createObjectURL(f) })),
    [files],
  )
  useEffect(
    () => () => previews.forEach((p) => URL.revokeObjectURL(p.url)),
    [previews],
  )

  const addFiles = (list) => {
    const imgs = Array.from(list || []).filter((f) =>
      f.type.startsWith('image/'),
    )
    if (imgs.length) setFiles((prev) => [...prev, ...imgs])
  }
  const removeFile = (i) =>
    setFiles((prev) => prev.filter((_, idx) => idx !== i))

  const canPost = (title.trim() || body.trim() || files.length) && !busy

  const submit = async (e) => {
    e.preventDefault()
    if (!canPost) return
    setBusy(true)
    try {
      await onSubmit?.({ title: title.trim(), body: body.trim(), files })
      setTitle('')
      setBody('')
      setFiles([])
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

  const hasAnything = title.trim() || body.trim() || previews.length

  const field =
    'w-full mb-5 rounded-[14px] border border-[#2c2c2c] bg-black px-4 py-3.5 text-[15px] text-[#f2f2f2] placeholder:text-[#6d6d6d] outline-none focus-visible:border-[#8a8a8a]'

  return (
    <div className="mx-auto grid max-w-[1440px] grid-cols-1 items-start gap-[30px] px-4 py-6 font-[Poppins,system-ui,sans-serif] text-[#f2f2f2] lg:grid-cols-[minmax(0,1fr)_480px] lg:px-10 lg:py-[60px]">
      {/* ---------- Preview ---------- */}
      <section
        aria-label="Post preview"
        className="order-2 flex min-h-[360px] items-start rounded-3xl border border-[#2c2c2c] bg-black p-7 lg:order-1 lg:min-h-[896px]"
      >
        {!hasAnything ? (
          <p className="m-auto text-[15px] font-medium text-[#8a8a8a]">
            Your post preview will appear here
          </p>
        ) : (
          <article className="w-full rounded-[22px] border border-[#2c2c2c] bg-[#14141a] p-5">
            <header className="mb-4 flex items-center gap-3.5">
              <div className="h-[60px] w-[60px] flex-none overflow-hidden rounded-full bg-[#2a2a33]">
                {user.avatar && (
                  <img
                    src={user.avatar}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div>
                <div className="text-[17px] font-semibold">@{user.name}</div>
                <div className="text-sm text-[#8a8a8a]">{today}</div>
              </div>
            </header>

            {(title.trim() || body.trim()) && (
              <div className="mb-4 rounded-2xl bg-white/[0.06] px-5 py-[18px]">
                {title.trim() && (
                  <h3 className="mb-1.5 text-xl font-semibold">{title}</h3>
                )}
                {body.trim() && (
                  <p className="whitespace-pre-wrap break-words text-[15px] font-medium leading-relaxed">
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
                      className="h-[300px] w-auto max-w-full flex-none snap-start rounded-2xl bg-[#222] object-cover lg:h-[420px]"
                    />
                  ))}
                </div>
                {previews.length > 1 && (
                  <button
                    type="button"
                    onClick={scrollNext}
                    aria-label="Next image"
                    className="absolute right-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-[rgba(60,60,66,0.85)] text-white hover:bg-[rgba(90,90,96,0.95)]"
                  >
                    <svg
                      width="18"
                      height="18"
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

      {/* ---------- Form ---------- */}
      <form
        onSubmit={submit}
        className="order-1 flex flex-col rounded-3xl border border-[#2c2c2c] bg-[#181818] p-[30px] shadow-[0_0_60px_10px_rgba(255,255,255,0.025)] lg:order-2"
      >
        <h2 className="mb-[22px] text-2xl font-semibold">New post</h2>

        <label htmlFor="np-title" className="mb-2 text-[15px] font-medium">
          Title
        </label>
        <input
          id="np-title"
          className={field}
          placeholder="Give it a title"
          value={title}
          maxLength={120}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label htmlFor="np-body" className="mb-2 text-[15px] font-medium">
          Text
        </label>
        <textarea
          id="np-body"
          className={`${field} min-h-[140px] resize-y`}
          placeholder="What's on your mind?"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />

        <span className="mb-2 text-[15px] font-medium">Images</span>
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) =>
            (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()
          }
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
          className={`flex min-h-[150px] cursor-pointer flex-col items-center justify-center gap-1 rounded-[18px] border border-dashed text-center outline-none transition-colors focus-visible:border-[#8a8a8a] ${
            dragging
              ? 'border-[#6a6a6a] bg-white/[0.04]'
              : 'border-[#3a3a3a] hover:border-[#6a6a6a] hover:bg-white/[0.04]'
          }`}
        >
          <strong className="text-base font-medium">Tap to add photos</strong>
          <small className="text-[13px] text-[#8a8a8a]">
            or drag and drop them here
          </small>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => {
              addFiles(e.target.files)
              e.target.value = ''
            }}
          />
        </div>

        {previews.length > 0 && (
          <ul className="mt-3.5 flex flex-wrap gap-2.5">
            {previews.map((p, i) => (
              <li key={p.url} className="relative h-[76px] w-[76px]">
                <img
                  src={p.url}
                  alt=""
                  className="h-full w-full rounded-xl object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  aria-label={`Remove image ${i + 1}`}
                  className="absolute -right-1.5 -top-1.5 h-[22px] w-[22px] rounded-full border border-[#2c2c2c] bg-black text-[15px] leading-none text-white"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}

        <button
          type="submit"
          disabled={!canPost}
          className="mt-7 h-[54px] rounded-[14px] bg-[#e0e0e0] text-base font-semibold text-black hover:enabled:bg-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? 'Posting…' : 'Post'}
        </button>
      </form>
    </div>
  )
}
