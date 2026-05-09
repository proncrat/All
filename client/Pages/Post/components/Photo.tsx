import { InputGroup, InputGroupInput } from '@/components/ui/input-group'

export function PhotoUpload() {
  const rootURL = new URL(`/api/v1`, document.baseURI)
  return (
    <form
      action={rootURL + '/imgupload'}
      method="POST"
      encType="multipart/form-data"
    >
      <input
        name="image"
        type="file"
        className="block w-full text-sm text-slate-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-violet-50 file:text-black
          hover:file:bg-violet-100
        "
      />
      <p className="mb-1">Name</p>
      <InputGroup>
        <InputGroupInput
          //onChange={formHandler}
          //value={form.describe}
          spellCheck="false"
          type="text"
          autoComplete="off"
          name="describe"
        />
      </InputGroup>
      <p className="mb-1">Describe</p>
      <InputGroup>
        <InputGroupInput
          //onChange={formHandler}
          //value={form.describe}
          spellCheck="false"
          type="text"
          autoComplete="off"
          name="describe"
        />
      </InputGroup>
      <button type="submit">Upload</button>
    </form>
  )
}
