import { useAddPhoto } from '@/client/hooks/useuploadphoto'
import { InputGroup, InputGroupInput } from '@/components/ui/input-group'
import { describe } from 'node:test'

export function PhotoUpload() {
  const rootURL = new URL(`/api/v1`, document.baseURI)

  const addPhoto = useAddPhoto()

  const handleSubmit = async (e) => {
    e.preventDefault()

    const formData = new FormData()
    formData.append('image', e.target.image.files[0])
    formData.append('name', e.target.name.value)
    formData.append('describe', e.target.describe.value)
    formData.append('author_id', 1)

    //console.log(data)
    await addPhoto.mutateAsync(formData)
  }

  return (
    <form onSubmit={handleSubmit}>
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
          name="name"
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
      <button
        type="submit"
        className="border pl-5 pr-5 rounded-lg cursor-pointer hover:bg-white hover:text-black"
      >
        Post
      </button>
    </form>
  )
}
