import { TextInput } from '@/client/components/TextInput'
import { useEffect, useMemo, useState } from 'react'
import { useUpdateProfile } from '@/client/hooks/useCustomize'

import { FiPlus, FiTrash2 } from 'react-icons/fi'

export type LinkItem = { name: string; link: string }

const MAX_LINKS = 10

export function LinksEditor({
  links,
  onChange,
}: {
  links: LinkItem[] | undefined
  onChange: (links: LinkItem[]) => void
}) {
  const list = links ?? []

  const update = (index: number, field: keyof LinkItem, value: string) =>
    onChange(list.map((l, i) => (i === index ? { ...l, [field]: value } : l)))

  const add = () => onChange([...list, { name: '', link: '' }])

  const remove = (index: number) => onChange(list.filter((_, i) => i !== index))

  return (
    <div>
      <p>Links</p>

      <div className="mt-3 flex flex-col gap-4">
        {list.length === 0 && (
          <p className="text-sm text-zinc-500">
            No links yet. Add one to show it on your profile.
          </p>
        )}

        {list.map((link, index) => (
          <div key={index} className="rounded-lg border border-zinc-800 p-4">
            <div className="mb-3 flex items-center justify-between">
              <p>Link {index + 1}</p>
              <button
                type="button"
                onClick={() => remove(index)}
                aria-label={`Delete link ${index + 1}`}
                className="cursor-pointer rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-red-500/10 hover:text-red-400 focus-visible:bg-red-500/10 focus-visible:text-red-400 focus-visible:outline-none"
              >
                <FiTrash2 size={16} />
              </button>
            </div>

            <p className="mb-1 text-sm text-zinc-400">Name</p>
            <TextInput
              onChange={(e) => update(index, 'name', e.target.value)}
              value={link.name}
              placeholder="website"
              spellCheck="false"
              type="text"
              autoComplete="off"
            />

            <p className="mb-1 mt-4 text-sm text-zinc-400">Link</p>
            <TextInput
              onChange={(e) => update(index, 'link', e.target.value)}
              value={link.link}
              placeholder="website.com"
              spellCheck="false"
              type="text"
              autoComplete="off"
            />
          </div>
        ))}

        <button
          type="button"
          onClick={add}
          disabled={list.length >= MAX_LINKS}
          className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-700 py-3 text-sm text-zinc-400 transition-colors hover:border-zinc-400 hover:text-white focus-visible:border-zinc-400 focus-visible:text-white focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-zinc-700 disabled:hover:text-zinc-400"
        >
          <FiPlus size={16} />
          {list.length >= MAX_LINKS
            ? `Limit of ${MAX_LINKS} links reached`
            : 'Add link'}
        </button>
      </div>
    </div>
  )
}

type ImageField = 'pfp' | 'bg' | 'banner'

export interface CustomizeData {
  name: string
  describe: string | null
  description: string | null
  links: string | LinkItem[] | null
  pfp: string | null
  bg: string | null
  banner: string | null
}

// SQLite returns the json column as a string, Postgres as an array
function parseLinks(raw: CustomizeData['links']): LinkItem[] {
  if (Array.isArray(raw)) return raw
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const FILE_INPUT_CLASS = `block w-full text-sm text-slate-500
  file:mr-4 file:py-2 file:px-4
  file:rounded-full file:border-0
  file:text-sm file:font-semibold
  file:bg-violet-50 file:text-violet-700
  hover:file:bg-violet-100 file:cursor-pointer`

function ImagePicker({
  label,
  name,
  src,
  imgClassName,
  onPick,
}: {
  label: string
  name: ImageField
  src: string | null
  imgClassName: string
  onPick: (name: ImageField, file: File | null) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <p>{label}</p>
      {src ? (
        <img className={`${imgClassName} object-cover`} alt={name} src={src} />
      ) : (
        <div
          className={`${imgClassName} flex items-center justify-center border border-dashed border-zinc-700 text-sm text-zinc-500`}
        >
          None
        </div>
      )}
      <input
        onChange={(e) => onPick(name, e.target.files?.[0] ?? null)}
        name={name}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className={FILE_INPUT_CLASS}
      />
    </div>
  )
}

export function CustomizeForm({ initialdata }: { initialdata: CustomizeData }) {
  const [form, setform] = useState({
    name: initialdata.name ?? '',
    describe: initialdata.describe ?? '',
    description: initialdata.description ?? '',
  })
  const [links, setLinks] = useState<LinkItem[]>(() =>
    parseLinks(initialdata.links),
  )
  // Saved image urls from the server
  const [saved, setSaved] = useState({
    pfp: initialdata.pfp,
    bg: initialdata.bg,
    banner: initialdata.banner,
  })
  // Newly chosen files (not uploaded yet)
  const [files, setFiles] = useState<Partial<Record<ImageField, File>>>({})
  const [fileInputKey, setFileInputKey] = useState(0)

  const { mutate, isPending, isSuccess, isError, error, reset } =
    useUpdateProfile()

  // Local preview urls for chosen files
  const previews = useMemo(() => {
    const out: Partial<Record<ImageField, string>> = {}
    for (const [k, file] of Object.entries(files)) {
      if (file) out[k as ImageField] = URL.createObjectURL(file)
    }
    return out
  }, [files])

  useEffect(
    () => () => Object.values(previews).forEach((u) => URL.revokeObjectURL(u)),
    [previews],
  )

  function formHandler(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setform((f) => ({ ...f, [name]: value }))
    reset()
  }

  function pickImage(name: ImageField, file: File | null) {
    setFiles((f) => {
      const next = { ...f }
      if (file) next[name] = file
      else delete next[name]
      return next
    })
    reset()
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData()
    data.append('name', form.name)
    data.append('describe', form.describe)
    data.append('description', form.description)
    data.append('links', JSON.stringify(links))
    for (const [k, file] of Object.entries(files)) {
      if (file) data.append(k, file)
    }

    mutate(data, {
      onSuccess: (updated) => {
        setSaved({ pfp: updated.pfp, bg: updated.bg, banner: updated.banner })
        setLinks(parseLinks(updated.links as CustomizeData['links']))
        setFiles({})
        setFileInputKey((k) => k + 1) // clear the file inputs
      },
    })
  }

  const errorText =
    (error as { response?: { text?: string } } | null)?.response?.text ||
    error?.message

  return (
    <form className="m-7 w-full" onSubmit={handleSubmit}>
      <h1 className="text-3xl mb-6">Customize Stuff</h1>
      <div className="flex flex-col gap-3">
        <h2 className="text-2xl">Profile</h2>
        <div>
          <p className="mb-1">Name</p>
          <TextInput
            onChange={formHandler}
            value={form.name}
            spellCheck="false"
            type="text"
            autoComplete="off"
            name="name"
            maxLength={50}
            required
          />
        </div>
        <div>
          <p className="mb-1">Describe</p>
          <TextInput
            onChange={formHandler}
            value={form.describe}
            spellCheck="false"
            type="text"
            autoComplete="off"
            name="describe"
            maxLength={200}
          />
        </div>
        <div>
          <p className="mb-1">Description</p>
          <TextInput
            onChange={formHandler}
            value={form.description}
            spellCheck="false"
            type="text"
            autoComplete="off"
            name="description"
            maxLength={5000}
          />
        </div>

        <LinksEditor
          links={links}
          onChange={(next) => {
            setLinks(next)
            reset()
          }}
        />

        <div key={fileInputKey} className="flex flex-col gap-5">
          <ImagePicker
            label="Pfp"
            name="pfp"
            src={previews.pfp ?? saved.pfp}
            imgClassName="rounded-xl aspect-square w-44 object-top"
            onPick={pickImage}
          />
          <ImagePicker
            label="Bg"
            name="bg"
            src={previews.bg ?? saved.bg}
            imgClassName="rounded-xl aspect-video w-100"
            onPick={pickImage}
          />
          <ImagePicker
            label="Banner"
            name="banner"
            src={previews.banner ?? saved.banner}
            imgClassName="rounded-xl aspect-10/2 w-100"
            onPick={pickImage}
          />
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={isPending}
            className="cursor-pointer rounded-lg border border-zinc-700 px-4 py-2 transition-colors hover:border-zinc-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? 'Saving...' : 'Save changes'}
          </button>
          {isSuccess && <p className="text-sm text-green-400">Saved</p>}
          {isError && (
            <p className="text-sm text-red-400">
              {errorText || 'Failed to save'}
            </p>
          )}
        </div>
      </div>
    </form>
  )
}
