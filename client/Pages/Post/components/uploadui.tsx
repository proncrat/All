import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router'

export const field =
  'w-full rounded-lg border border-white/20 bg-black px-3 py-2.5 text-base text-white ' +
  'placeholder:text-white/40 outline-none transition-colors ' +
  'focus:border-white sm:text-sm'

export const card =
  'w-full max-w-xl space-y-5 self-center rounded-2xl border border-white/20 ' +
  'bg-linear-to-b from-black to-neutral-900 p-4 shadow-[0_0_40px_rgba(255,255,255,0.04)] ' +
  'sm:p-6 lg:w-96 lg:shrink-0 lg:self-start'

/** Object URL for a File/Blob that is revoked automatically. */
export function useObjectUrl(file: Blob | null) {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    if (!file) return setUrl(null)
    const u = URL.createObjectURL(file)
    setUrl(u)
    return () => URL.revokeObjectURL(u)
  }, [file])
  return url
}

/** Formats seconds as m:ss or h:mm:ss. */
export function formatRuntime(seconds: number) {
  const s = Math.max(0, Math.round(seconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = String(s % 60).padStart(2, '0')
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`
}

/** "my_cool-song.mp3" -> "my cool-song" */
export function titleFromFilename(name: string) {
  return name
    .replace(/\.[^.]+$/, '')
    .replace(/_/g, ' ')
    .trim()
}

export function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`
}

/** Dashed drop zone with an invisible file input stretched over it. */
export function DropZone({
  accept,
  onFile,
  children,
  className = '',
  inputKey,
}: {
  accept: string
  onFile: (file: File | null) => void
  children: ReactNode
  className?: string
  inputKey?: number
}) {
  return (
    <div
      className={`relative flex w-full items-center justify-center overflow-hidden rounded-xl
        border border-dashed border-white/30 transition-colors hover:border-white ${className}`}
    >
      {children}
      <input
        key={inputKey}
        type="file"
        accept={accept}
        onChange={(e) => onFile(e.target.files?.[0] ?? null)}
        className="absolute inset-0 cursor-pointer opacity-0"
      />
    </div>
  )
}

export function ProgressBar({ percent }: { percent: number }) {
  return (
    <div
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      className="h-1.5 w-full overflow-hidden rounded-full bg-white/10"
    >
      <div
        className="h-full bg-white transition-[width] duration-200"
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}

export function SignInNotice({ what }: { what: string }) {
  return (
    <p className="py-16 text-center text-sm text-white/60">
      <Link to="/signin" className="underline hover:text-white">
        Sign in
      </Link>{' '}
      to upload {what}.
    </p>
  )
}
