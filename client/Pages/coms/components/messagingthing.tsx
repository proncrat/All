import { useMessages } from '@/client/hooks'
import { useParams } from 'react-router'
import { Sendbox } from './SENDBOX'
import { ShownMessage } from './messages'
import { FaPhone } from 'react-icons/fa6'
import { Call } from './call'
import { useFetchId } from '@/client/hooks/useId'
import { useNthParent } from '../../Util/call/Context'
import { useEffect, useRef, useState, useCallback } from 'react'
import { FaChevronDown } from 'react-icons/fa'
import { useMessageSocket } from '@/client/hooks/useMessageSocket'
import { Link } from 'react-router'
import { FaChevronLeft } from 'react-icons/fa6'

// mirrors a real message: avatar, name + timestamp line, then text (or an image)
function MessageSkeleton({
  lineWidth,
  image = false,
}: {
  lineWidth: string
  image?: boolean
}) {
  return (
    <div className="flex gap-5 animate-pulse">
      <div className="size-14 rounded-full bg-zinc-800 shrink-0" />
      <div className="flex flex-col gap-2 pt-1">
        <div className="flex items-center gap-3">
          <div className="h-4 w-12 rounded bg-zinc-800" />
          <div className="h-3 w-32 rounded bg-zinc-900" />
        </div>
        {image ? (
          <div className="w-[480px] max-w-full aspect-video rounded bg-zinc-900" />
        ) : (
          <div className={`h-4 rounded bg-zinc-800 ${lineWidth}`} />
        )}
      </div>
    </div>
  )
}

const SKELETONS = [
  { w: 'w-16' },
  { w: 'w-64', image: true },
  { w: 'w-40' },
  { w: 'w-24' },
  { w: 'w-56' },
  { w: 'w-20' },
]

export function Messagebox() {
  const { id } = useParams()

  const [mutationstate, setmessageload] = useState(false)

  const { data, isPending, isError, error, isSuccess } = useMessages(id)

  useMessageSocket(id)

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

  return (
    <div className="flex flex-col h-full relative">
      {callStatus && <Call callback={setcallStatus} />}
      <div className="h-12 border-b border-zinc-800 flex items-center gap-3 p-2">
        <Link to="/coms" className="md:hidden" aria-label="Back to chats">
          <FaChevronLeft size={'20px'} />
        </Link>

        <button
          onClick={() => handleChildAction({ name: 'test', userId: '...' })}
          className="cursor-pointer"
        >
          <FaPhone className="hover:fill-gray-500" size={'20px'} />
        </button>
      </div>
      <div className="flex-1 h-0 relative">
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className={`h-full p-5 flex flex-col gap-8 scrollbar scrollbar-thin scrollbar-thumb-zinc-600 scrollbar-track-transparent hover:scrollbar-thumb-zinc-400 ${
            isPending ? 'overflow-hidden' : 'overflow-auto'
          }`}
        >
          {isPending &&
            SKELETONS.map((s, i) => (
              <MessageSkeleton key={i} lineWidth={s.w} />
            ))}

          {isError && <p>Failed to load messages</p>}

          {data?.map((message) => (
            <ShownMessage key={message.id} data={message} userId={userid} />
          ))}
        </div>

        <button
          onClick={() => scrollToBottom('smooth')}
          aria-label="Scroll to bottom"
          aria-hidden={!showScrollButton}
          tabIndex={showScrollButton ? 0 : -1}
          className={`absolute bottom-4 right-6 p-3 rounded-full bg-zinc-700 text-white shadow-lg hover:bg-zinc-600 cursor-pointer
          transition-all duration-200 ease-out
          ${
            showScrollButton
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-2 pointer-events-none'
          }`}
        >
          <FaChevronDown size={16} />
        </button>
      </div>
      <div className="h-12">
        <Sendbox statecontrol={setmessageload} />
      </div>
    </div>
  )
}
