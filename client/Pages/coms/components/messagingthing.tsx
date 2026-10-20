import { useMessages } from '@/client/hooks'
import { useParams } from 'react-router'
import { Sendbox } from './SENDBOX'
import { ShownMessage } from './messages'
import { FaPhone } from 'react-icons/fa6'
import { Call } from './call'
import { useFetchId } from '@/client/hooks/useId'
import { Spinner } from '../../Util/Spinner'
import { useNthParent } from '../../Util/call/Context'
import { useEffect, useRef, useState, useCallback } from 'react'
import { FaChevronDown } from 'react-icons/fa'

export function Messagebox() {
  const { id } = useParams()

  const [mutationstate, setmessageload] = useState(false)

  const { data, isPending, isError, error, isSuccess } = useMessages(id)

  const [callStatus, setcallStatus] = useState(false)

  const { data: leId, loading: leLoading, error: leError } = useFetchId()

  const userid = leId.userid

  const { handleChildAction } = useNthParent()

  const test_data = {
    name: 'bro',
    userId: 'rztLnolAoFGAaevREVdZcUgsv7GXVlEq',
  }

  //CLAUDE BETTER THEN GOGGLE

  // inside your component
  const containerRef = useRef<HTMLDivElement>(null)
  const isAtBottomRef = useRef(true)
  const [showScrollButton, setShowScrollButton] = useState(false)

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    const el = containerRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior })
  }, [])

  const handleScroll = () => {
    const el = containerRef.current
    if (!el) return
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight
    const atBottom = distance < 50
    isAtBottomRef.current = atBottom
    setShowScrollButton(!atBottom)
  }

  // auto-scroll on new messages only if the user was already at the bottom
  useEffect(() => {
    if (isAtBottomRef.current) scrollToBottom('auto')
  }, [data, scrollToBottom])

  // jump to bottom on first mount
  useEffect(() => {
    scrollToBottom('auto')
  }, [scrollToBottom])

  if (isPending) {
    return <Spinner />
  }

  return (
    <div className="flex flex-col h-full relative">
      {callStatus && <Call callback={setcallStatus} />}
      <div className=" h-12 border-b-2 flex p-2">
        <button
          onClick={() =>
            handleChildAction({
              name: 'test',
              userId: '',
            })
          }
          className="cursor-pointer"
        >
          <FaPhone className="hover:fill-gray-500" size={'20px'} />
        </button>
      </div>
      <div className="flex-1 h-0 relative">
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className=" h-full p-5 flex flex-col gap-8 overflow-auto scrollbar hover:scrollbar-thumb-zinc-400 hover:scrollbar-track-[lab(2.75381% 0 0)]"
        >
          {data.map((message) => (
            <ShownMessage key={message.id} data={message} userId={userid} />
          ))}
        </div>

        {showScrollButton && (
          <button
            onClick={() => scrollToBottom('smooth')}
            className="absolute bottom-4 right-6 p-3 rounded-full bg-zinc-700 text-white shadow-lg hover:bg-zinc-600 cursor-pointer"
            aria-label="Scroll to bottom"
          >
            <FaChevronDown size={16} />
          </button>
        )}
      </div>
      <div className="h-12">
        <Sendbox statecontrol={setmessageload} />
      </div>
    </div>
  )
}
