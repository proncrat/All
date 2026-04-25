import { useComments, Usesessionid } from '@/client/hooks'
import { useAddComment } from '@/client/hooks/usecomments'

import { comment } from '@/client/models/comment'
import { useParams } from 'react-router'

import { ImBin } from 'react-icons/im'
import { useSession } from '@/lib/auth'

export function ProfileComments() {
  const { id } = useParams()
  const addcomment = useAddComment()
  const { data: lesesh } = useSession()
  const { data: idcheck, isSuccess } = Usesessionid(lesesh?.session.userId)

  const handleSubmit = async (e) => {
    e.preventDefault()

    const data = {
      link_type: 'profile',
      link_id: id,
      author_id: 1,
      body_text: e.target.text.value,
      post_date: new Date(),
    }

    await addcomment.mutateAsync(data)
  }

  const { data, isPending, isError, error } = useComments(id, 'profile')

  if (isPending) {
    return <div>Loading...</div>
  }

  if (isError) {
    return <div>Error: {error.message}</div>
  }

  return (
    <div>
      <h2 className="text-2xl mb-2">The warzone</h2>
      <form onSubmit={handleSubmit} className="flex gap-4 mb-8">
        <input
          name="text"
          type="text"
          className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-slate-400"
          placeholder="Add a comment"
        />
        <button className="border pl-5 pr-5 rounded-lg cursor-pointer hover:bg-white hover:text-black">
          Post
        </button>
      </form>
      <div>
        {data.map((item: comment) => (
          <div
            key={item.id}
            className="flex justify-between mb-4 bg-[#00000075] rounded-lg p-2"
          >
            <div className="flex gap-4">
              <img
                className="rounded-lg w-20 aspect-square"
                alt="some pfp"
                src={item.pfp}
              ></img>
              <div>
                <div className="flex gap-4 align-baseline">
                  <p className="text-lg">{item.name}</p>
                  <p>{item.post_date.toString()}</p>
                </div>
                <p>{item.body_text}</p>
              </div>
            </div>
            <div>
              {idcheck && idcheck.id === item.authorId && (
                <button className="cursor-pointer">
                  <ImBin />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
