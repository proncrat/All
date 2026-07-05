import { useAddPhoto } from '@/client/hooks/useuploadphoto'
import { useParams } from 'react-router'

export function Preview({ file, callback }) {
  const { id } = useParams()

  function cumback() {
    callback({ active: false })
  }

  const addPhoto = useAddPhoto()

  const data = {
    chatid: id,
    senderid: null,
    type: 'img',
    text: null,
    send_date: null,
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const formData = new FormData()
    formData.append('image', file.data)
    formData.append('name', file.filename)
    formData.append('describe', 'this is alt text')
    formData.append('author_id', '1')
    formData.append('msgdata', JSON.stringify(data))

    console.log(formData)
    await addPhoto.mutateAsync(formData)
    cumback()
  }

  return (
    <div className="absolute bottom-12 bg-tpbackground border-2 rounded-sm pl-2 pr-2 ">
      <div className="flex gap-2 p-1 justify-end">
        <button>Modify</button>
        <button className="cursor-pointer" onClick={cumback}>
          X
        </button>
        <button className="cursor-pointer" onClick={handleSubmit}>
          &#8594;
        </button>
      </div>
      <img className="w-60 rounded-sm" src={file.previewUrl} alt="" />
      <p>{file.filename}</p>
    </div>
  )
}
