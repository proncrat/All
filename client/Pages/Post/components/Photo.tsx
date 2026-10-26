import { useEffect, useState, type FormEvent, type ChangeEvent } from 'react'
import { useAddPhoto } from '@/client/hooks/useuploadphoto'

const field =
  'w-full rounded-lg border border-white/20 bg-black px-3 py-2.5 text-base text-white ' +
  'placeholder:text-white/40 outline-none transition-colors ' +
  'focus:border-white sm:text-sm'

export function PhotoUpload() {
  const addPhoto = useAddPhoto()
  const [preview, setPreview] = useState<string | null>(null)

  // Revoke the object URL when the preview changes or the component unmounts
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  // Hide the success message after 3 seconds
  const { isSuccess, reset } = addPhoto
  useEffect(() => {
    if (!isSuccess) return
    const t = setTimeout(() => reset(), 3000)
    return () => clearTimeout(t)
  }, [isSuccess, reset])

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    // Clear any previous success/error message when a new file is picked
    addPhoto.reset()
    const file = e.target.files?.[0]
    setPreview(file ? URL.createObjectURL(file) : null)
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const els = form.elements

    const formData = new FormData()
    formData.append(
      'image',
      (els.namedItem('image') as HTMLInputElement).files![0],
    )
    formData.append('name', (els.namedItem('name') as HTMLInputElement).value)
    formData.append(
      'describe',
      (els.namedItem('describe') as HTMLTextAreaElement).value,
    )
    formData.append('author_id', '1')

    try {
      await addPhoto.mutateAsync(formData)
      form.reset()
      setPreview(null)
    } catch {
      // The error message is shown via addPhoto.isError
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 py-4 sm:py-8 lg:flex-row lg:items-start lg:justify-center">
      <div
        className="relative hidden min-h-[24rem] min-w-0 flex-1 overflow-hidden
    rounded-2xl border border-white/20 bg-black lg:sticky lg:top-4 lg:block
    lg:h-[calc(100vh-14rem)] lg:max-h-[56rem]"
      >
        {preview ? (
          <div
            role="img"
            aria-label="Preview"
            className="absolute inset-3 bg-contain bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${preview})` }}
          />
        ) : (
          <p className="flex h-full items-center justify-center text-sm text-white/40">
            Your photo preview will appear here
          </p>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl space-y-5 self-center rounded-2xl border border-white/20 bg-linear-to-b from-black to-neutral-900 p-4 shadow-[0_0_40px_rgba(255,255,255,0.04)] sm:p-6 lg:w-96 lg:shrink-0 lg:self-start"
      >
        <h1 className="text-xl font-semibold">New photo</h1>

        <div className="space-y-1.5">
          <span className="text-sm font-medium">Image</span>
          <div
            className={`relative flex w-full items-center justify-center overflow-hidden rounded-xl
              border border-dashed border-white/30 transition-colors hover:border-white
              ${preview ? 'bg-black lg:py-8' : 'aspect-video'}`}
          >
            {preview ? (
              <>
                <img
                  src={preview}
                  alt="Preview"
                  className="mx-auto block h-auto max-h-[70vh] w-auto max-w-full object-contain lg:hidden"
                />
                <span className="pointer-events-none absolute bottom-2 right-2 rounded-md border border-white/30 bg-black/70 px-2 py-1 text-xs lg:hidden">
                  Change
                </span>
                {/* Wide screens: preview is on the left, so just show a compact state */}
                <p className="pointer-events-none hidden text-sm font-medium lg:block">
                  Photo selected. Click to change
                </p>
              </>
            ) : (
              <div className="pointer-events-none px-4 text-center">
                <p className="text-sm font-medium">Tap to choose a photo</p>
                <p className="mt-1 text-xs text-white/50">
                  or drag and drop it here
                </p>
              </div>
            )}
            <input
              name="image"
              type="file"
              accept="image/*"
              required
              onChange={handleFile}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="name" className="text-sm font-medium">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="off"
            spellCheck={false}
            placeholder="Give it a title"
            className={field}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="describe" className="text-sm font-medium">
            Describe
          </label>
          <textarea
            id="describe"
            name="describe"
            rows={3}
            autoComplete="off"
            placeholder="What's this photo about?"
            className={`${field} resize-none`}
          />
        </div>

        <button
          type="submit"
          disabled={addPhoto.isPending}
          className="min-h-11 w-full cursor-pointer rounded-lg bg-white px-5 text-sm font-semibold text-black
            transition-colors hover:bg-white/85 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {addPhoto.isPending ? 'Posting…' : 'Post'}
        </button>

        {addPhoto.isSuccess && (
          <p role="status" className="text-sm text-green-400">
            Photo posted successfully!
          </p>
        )}

        {addPhoto.isError && (
          <p role="alert" className="text-sm text-red-400">
            Upload failed. Please try again.
          </p>
        )}
      </form>
    </div>
  )
}
