import { updateUser, deleteUser } from '@/lib/auth'

export function Authsett() {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    await updateUser({
      image: form.image.value,
    })
  }

  async function ledelety() {
    await deleteUser()
  }

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
      <button
        onClick={ledelety}
        className="border p-2  rounded-sm hover:bg-white hover:text-black transition-all cursor-pointer"
      >
        Le delety
      </button>
    </div>
  )
}
