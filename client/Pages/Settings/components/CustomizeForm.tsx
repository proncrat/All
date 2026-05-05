import { Usesessionid, useUserData } from '@/client/hooks'
import { InputGroup, InputGroupInput } from '@/components/ui/input-group'
import { useSession } from '@/lib/auth'
import { useState } from 'react'

export function CustomizeForm({ initialdata }) {
  const [form, setform] = useState(initialdata)

  function formHandler(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    const name = e.target.name
    setform({ ...form, [name]: value })
  }

  function linkHandler(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    const name = e.target.name
    setform({ ...form, [name]: value })
  }

  const links = JSON.parse(form.links)
  console.log(links)

  function imgHandler(e) {
    const value = URL.createObjectURL(e.target.files[0])
    const name = e.target.name
    setform({ ...form, [name]: value })
  }

  return (
    <div className="m-7 w-full">
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

        <p>Links</p>
        {links && (
          <div>
            {links.map((link, index) => (
              <div key={index}>
                <p className="mb-2">Link {index + 1}</p>
                <p className="mb-1">Name</p>
                <InputGroup>
                  <InputGroupInput
                    onChange={linkHandler}
                    value={link.name}
                    spellCheck="false"
                    type="text"
                    autoComplete="off"
                    name={'name' + index}
                  />
                </InputGroup>
                <p className="mb-1 mt-4">Link</p>
                <InputGroup>
                  <InputGroupInput
                    onChange={linkHandler}
                    value={link.link}
                    spellCheck="false"
                    type="text"
                    autoComplete="off"
                    name={'link' + index}
                  />
                </InputGroup>
              </div>
            ))}
          </div>
        )}

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
        <img className="rounded-xl w-100" alt="pfp" src={form.bg} />
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
          alt="pfp"
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
