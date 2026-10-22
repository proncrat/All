import { InputGroup, InputGroupInput } from '@/components/ui/input-group'
import { useMemo, useState } from 'react'
import { updateUser } from '@/lib/auth'

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
            <InputGroup>
              <InputGroupInput
                onChange={(e) => update(index, 'name', e.target.value)}
                value={link.name}
                placeholder="website"
                spellCheck="false"
                type="text"
                autoComplete="off"
              />
            </InputGroup>

            <p className="mb-1 mt-4 text-sm text-zinc-400">Link</p>
            <InputGroup>
              <InputGroupInput
                onChange={(e) => update(index, 'link', e.target.value)}
                value={link.link}
                placeholder="website.com"
                spellCheck="false"
                type="text"
                autoComplete="off"
              />
            </InputGroup>
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

export function CustomizeForm({ initialdata }) {
  const [form, setform] = useState(initialdata)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formEl = e.currentTarget
    await updateUser({
      image: formEl.image.value,
    })
  }

  function formHandler(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    const name = e.target.name
    setform((f) => ({ ...f, [name]: value }))
  }

  function imgHandler(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const value = URL.createObjectURL(file)
    const name = e.target.name
    setform((f) => ({ ...f, [name]: value }))
  }

  // parse safely so empty/invalid JSON doesn't crash the page
  const links: LinkItem[] = useMemo(() => {
    try {
      const parsed = JSON.parse(form.links)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }, [form.links])

  return (
    <div className="m-7 w-full">
      <h1 className="text-3xl mb-6">Auth Image Test</h1>
      <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
        <input
          className="p-2 border-b"
          name="image"
          type="text"
          placeholder="imgurl"
        />

        <button
          className="transition-all cursor-pointer hover:[box-shadow:0px_0px_4px_1px_rgba(255,255,255,0.74)_inset] rounded-sm p-1"
          type="submit"
        >
          Submit
        </button>
      </form>
      <h1 className="text-3xl mb-6">Customize Stuff</h1>
      <div className="flex flex-col gap-3">
        <h2 className="text-2xl">Profile</h2>
        <div>
          <p className="mb-1">Name</p>
          <InputGroup>
            <InputGroupInput
              onChange={formHandler}
              value={form.name}
              spellCheck="false"
              type="text"
              autoComplete="off"
              name="name"
            />
          </InputGroup>
        </div>
        <div>
          <p className="mb-1">Describe</p>
          <InputGroup>
            <InputGroupInput
              onChange={formHandler}
              value={form.describe}
              spellCheck="false"
              type="text"
              autoComplete="off"
              name="describe"
            />
          </InputGroup>
        </div>
        <div>
          <p className="mb-1">Description</p>
          <InputGroup>
            <InputGroupInput
              onChange={formHandler}
              value={form.description}
              spellCheck="false"
              type="text"
              autoComplete="off"
              name="description"
            />
          </InputGroup>
        </div>

        <LinksEditor
          links={links}
          onChange={(next) =>
            setform((f) => ({ ...f, links: JSON.stringify(next) }))
          }
        />

        <p>Pfp</p>
        <img
          className="rounded-xl aspect-square w-44"
          alt="pfp"
          src={form.pfp}
        />
        <input
          onChange={imgHandler}
          name="pfp"
          type="file"
          className="block w-full text-sm text-slate-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-violet-50 file:text-violet-700
          hover:file:bg-violet-100
        "
        />
        <p>Bg</p>
        <img className="rounded-xl w-100" alt="bg" src={form.bg} />
        <input
          onChange={imgHandler}
          name="bg"
          type="file"
          className="block w-full text-sm text-slate-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-violet-50 file:text-violet-700
          hover:file:bg-violet-100
        "
        />
        <p>Banner</p>
        <img
          className="rounded-xl aspect-10/2 w-100"
          alt="banner"
          src={form.banner}
        />
        <input
          onChange={imgHandler}
          name="banner"
          type="file"
          className="block w-full text-sm text-slate-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-violet-50 file:text-violet-700
          hover:file:bg-violet-100
        "
        />
        <button>Save changes</button>
      </div>
    </div>
  )
}
