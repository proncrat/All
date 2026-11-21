import { useState, type FormEvent } from 'react'
import { useUploadSong } from '@/client/hooks/usemediaupload'
import {
  card,
  DropZone,
  field,
  formatBytes,
  formatRuntime,
  ProgressBar,
  titleFromFilename,
  useObjectUrl,
} from './uploadui'

const AUDIO_ACCEPT =
  'audio/mpeg,audio/mp4,audio/x-m4a,audio/aac,audio/ogg,audio/wav,audio/webm,audio/flac,.mp3,.m4a,.ogg,.wav,.flac'

export function SongUpload({ defaultArtist }: { defaultArtist?: string }) {
  const upload = useUploadSong()

  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [cover, setCover] = useState<File | null>(null)
  const [runtime, setRuntime] = useState<string | null>(null)
  const [unreadable, setUnreadable] = useState(false)
  const [name, setName] = useState('')
  const [artist, setArtist] = useState('')
  const [inputKey, setInputKey] = useState(0)

  const audioUrl = useObjectUrl(audioFile)
  const coverUrl = useObjectUrl(cover)

  const pickAudio = (file: File | null) => {
    upload.reset()
    setAudioFile(file)
    setRuntime(null)
    setUnreadable(false)
    if (file && !name) setName(titleFromFilename(file.name))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!audioFile || !runtime) return

    const formData = new FormData()
    formData.append('name', name)
    formData.append('author', artist)
    formData.append('runtime', runtime)
    formData.append('audio', audioFile)
    if (cover) formData.append('cover', cover)

    try {
      await upload.mutateAsync(formData)
      setAudioFile(null)
      setCover(null)
      setRuntime(null)
      setName('')
      setArtist('')
      setInputKey((k) => k + 1)
    } catch {
      // Shown via upload.isError
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 py-4 sm:py-8 lg:flex-row lg:items-start lg:justify-center">
      {/* Cover + audio preview */}
      <div className="flex min-w-0 flex-1 flex-col items-center gap-4">
        <DropZone
          accept="image/jpeg,image/png,image/webp,image/gif"
          onFile={setCover}
          inputKey={inputKey}
          className="aspect-square max-w-sm bg-black"
        >
          {coverUrl ? (
            <>
              <img
                src={coverUrl}
                alt="Cover preview"
                className="h-full w-full object-cover"
              />
              <span className="pointer-events-none absolute bottom-2 right-2 rounded-md border border-white/30 bg-black/70 px-2 py-1 text-xs">
                Change cover
              </span>
            </>
          ) : (
            <div className="pointer-events-none px-4 text-center">
              <p className="text-sm font-medium">Cover art</p>
              <p className="mt-1 text-xs text-white/50">
                Optional · tap to choose a square image
              </p>
            </div>
          )}
        </DropZone>

        {cover && (
          <button
            type="button"
            onClick={() => {
              setCover(null)
              setInputKey((k) => k + 1)
            }}
            className="cursor-pointer text-xs text-white/60 underline hover:text-white"
          >
            Remove cover
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className={card}>
        <h1 className="text-xl font-semibold">New song</h1>

        <div className="space-y-1.5">
          <span className="text-sm font-medium">Audio file</span>
          {audioFile && audioUrl ? (
            <div className="space-y-2 rounded-xl border border-white/20 p-3">
              <div className="flex items-center justify-between gap-2 text-xs text-white/60">
                <span className="min-w-0 truncate">
                  {audioFile.name} · {formatBytes(audioFile.size)}
                  {runtime && ` · ${runtime}`}
                </span>
                <button
                  type="button"
                  disabled={upload.isPending}
                  onClick={() => pickAudio(null)}
                  className="shrink-0 cursor-pointer rounded-md border border-white/30 px-2 py-1 hover:border-white disabled:opacity-50"
                >
                  Change
                </button>
              </div>
              <audio
                src={audioUrl}
                controls
                preload="metadata"
                onLoadedMetadata={(e) => {
                  const d = e.currentTarget.duration
                  if (Number.isFinite(d)) setRuntime(formatRuntime(d))
                  else setUnreadable(true)
                }}
                onError={() => setUnreadable(true)}
                className="w-full"
              />
              {unreadable && (
                <p className="text-xs text-red-400">
                  Your browser can&apos;t read this file&apos;s length. Try an
                  MP3, M4A, OGG or WAV.
                </p>
              )}
            </div>
          ) : (
            <DropZone
              accept={AUDIO_ACCEPT}
              onFile={pickAudio}
              inputKey={inputKey}
              className="h-28"
            >
              <div className="pointer-events-none px-4 text-center">
                <p className="text-sm font-medium">Tap to choose a song</p>
                <p className="mt-1 text-xs text-white/50">
                  MP3, M4A, OGG, WAV, FLAC
                </p>
              </div>
            </DropZone>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="song-name" className="text-sm font-medium">
            Title
          </label>
          <input
            id="song-name"
            type="text"
            required
            maxLength={200}
            autoComplete="off"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Song title"
            className={field}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="song-artist" className="text-sm font-medium">
            Artist
          </label>
          <input
            id="song-artist"
            type="text"
            maxLength={200}
            autoComplete="off"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            placeholder={defaultArtist || 'Artist name'}
            className={field}
          />
          <p className="text-xs text-white/40">
            Leave empty to use your username.
          </p>
        </div>

        <button
          type="submit"
          disabled={!audioFile || !runtime || upload.isPending}
          className="min-h-11 w-full cursor-pointer rounded-lg bg-white px-5 text-sm font-semibold text-black
            transition-colors hover:bg-white/85 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {upload.isPending ? `Uploading… ${upload.progress}%` : 'Upload song'}
        </button>

        {upload.isPending && <ProgressBar percent={upload.progress} />}

        {upload.isSuccess && (
          <p role="status" className="text-sm text-green-400">
            Song uploaded! It&apos;s now on your profile.
          </p>
        )}

        {upload.isError && (
          <p role="alert" className="text-sm text-red-400">
            {upload.error.message}
          </p>
        )}
      </form>
    </div>
  )
}
