import { useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { useUploadVideo } from '@/client/hooks/usemediaupload'
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

/** Grabs a frame from a playing/loaded <video> as a JPEG blob. */
function captureFrame(video: HTMLVideoElement): Promise<Blob | null> {
  const canvas = document.createElement('canvas')
  const scale = Math.min(1, 1280 / (video.videoWidth || 1280))
  canvas.width = Math.round(video.videoWidth * scale)
  canvas.height = Math.round(video.videoHeight * scale)
  const ctx = canvas.getContext('2d')
  if (!ctx || !canvas.width || !canvas.height) return Promise.resolve(null)
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85))
}

export function VideoUpload() {
  const upload = useUploadVideo()
  const videoRef = useRef<HTMLVideoElement>(null)

  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [customThumb, setCustomThumb] = useState<File | null>(null)
  const [autoThumb, setAutoThumb] = useState<Blob | null>(null)
  const [duration, setDuration] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [inputKey, setInputKey] = useState(0)

  const videoUrl = useObjectUrl(videoFile)
  const thumbUrl = useObjectUrl(customThumb ?? autoThumb)

  const pickVideo = (file: File | null) => {
    upload.reset()
    setVideoFile(file)
    setAutoThumb(null)
    setDuration(null)
    if (file && !name) setName(titleFromFilename(file.name))
  }

  // Once the preview has loaded, jump a little way in and grab a thumbnail
  const onMetadata = () => {
    const v = videoRef.current
    if (!v) return
    setDuration(v.duration)
    v.currentTime = Math.min(1, v.duration / 4 || 0)
  }
  const onSeeked = async () => {
    const v = videoRef.current
    if (v && !autoThumb) setAutoThumb(await captureFrame(v))
  }
  const grabCurrentFrame = async () => {
    const v = videoRef.current
    if (!v) return
    setCustomThumb(null)
    setAutoThumb(await captureFrame(v))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!videoFile) return

    const formData = new FormData()
    formData.append('name', name)
    formData.append('description', description)
    formData.append('video', videoFile)
    const thumb = customThumb ?? autoThumb
    if (thumb) {
      formData.append(
        'thumbnail',
        thumb,
        customThumb ? customThumb.name : 'thumbnail.jpg',
      )
    }

    try {
      await upload.mutateAsync(formData)
      setVideoFile(null)
      setCustomThumb(null)
      setAutoThumb(null)
      setDuration(null)
      setName('')
      setDescription('')
      setInputKey((k) => k + 1)
    } catch {
      // Shown via upload.isError
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 py-4 sm:py-8 lg:flex-row lg:items-start lg:justify-center">
      {/* Preview */}
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/20 bg-black">
          {videoUrl ? (
            <video
              ref={videoRef}
              src={videoUrl}
              controls
              playsInline
              preload="metadata"
              onLoadedMetadata={onMetadata}
              onSeeked={onSeeked}
              className="h-full w-full object-contain"
            />
          ) : (
            <DropZone
              accept="video/mp4,video/webm,video/ogg,video/quicktime"
              onFile={pickVideo}
              inputKey={inputKey}
              className="h-full border-0"
            >
              <div className="pointer-events-none px-4 text-center">
                <p className="text-sm font-medium">Tap to choose a video</p>
                <p className="mt-1 text-xs text-white/50">
                  or drag and drop it here · MP4, WebM, MOV up to 1 GB
                </p>
              </div>
            </DropZone>
          )}
        </div>

        {videoFile && (
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-white/60">
            <span className="min-w-0 truncate">
              {videoFile.name} · {formatBytes(videoFile.size)}
              {duration != null && ` · ${formatRuntime(duration)}`}
            </span>
            <button
              type="button"
              disabled={upload.isPending}
              onClick={() => pickVideo(null)}
              className="cursor-pointer rounded-md border border-white/30 px-2 py-1 hover:border-white disabled:opacity-50"
            >
              Change video
            </button>
          </div>
        )}
      </div>

      {/* Details */}
      <form onSubmit={handleSubmit} className={card}>
        <h1 className="text-xl font-semibold">New video</h1>

        <div className="space-y-1.5">
          <label htmlFor="video-name" className="text-sm font-medium">
            Title
          </label>
          <input
            id="video-name"
            type="text"
            required
            maxLength={200}
            autoComplete="off"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Give it a title"
            className={field}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="video-description" className="text-sm font-medium">
            Description
          </label>
          <textarea
            id="video-description"
            rows={4}
            maxLength={5000}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell viewers about your video"
            className={`${field} resize-none`}
          />
        </div>

        <div className="space-y-1.5">
          <span className="text-sm font-medium">Thumbnail</span>
          <DropZone
            accept="image/jpeg,image/png,image/webp,image/gif"
            onFile={setCustomThumb}
            inputKey={inputKey}
            className="aspect-video bg-black"
          >
            {thumbUrl ? (
              <>
                <img
                  src={thumbUrl}
                  alt="Thumbnail preview"
                  className="h-full w-full object-cover"
                />
                <span className="pointer-events-none absolute bottom-2 right-2 rounded-md border border-white/30 bg-black/70 px-2 py-1 text-xs">
                  {customThumb ? 'Custom · change' : 'Auto · upload your own'}
                </span>
              </>
            ) : (
              <p className="pointer-events-none px-4 text-center text-xs text-white/50">
                Pick a video to generate one, or upload an image
              </p>
            )}
          </DropZone>
          {videoFile && (
            <button
              type="button"
              onClick={grabCurrentFrame}
              className="cursor-pointer text-xs text-white/60 underline hover:text-white"
            >
              Use current frame from the preview
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={!videoFile || upload.isPending}
          className="min-h-11 w-full cursor-pointer rounded-lg bg-white px-5 text-sm font-semibold text-black
            transition-colors hover:bg-white/85 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {upload.isPending ? `Uploading… ${upload.progress}%` : 'Upload video'}
        </button>

        {upload.isPending && <ProgressBar percent={upload.progress} />}

        {upload.isSuccess && (
          <p role="status" className="text-sm text-green-400">
            Video uploaded!{' '}
            <Link to={`/video/${upload.data.id}`} className="underline">
              Watch it
            </Link>
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
