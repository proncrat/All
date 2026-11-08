import { AiOutlineLoading } from 'react-icons/ai'

export function Spinner({ size = 40 }) {
  return (
    <div className="flex justify-center py-6">
      <AiOutlineLoading className="animate-spin rounded-full" size={size} />
    </div>
  )
}
