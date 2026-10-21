import { Link } from 'react-router'
import {
  IoEllipsisVerticalOutline,
  IoTrashOutline,
  IoPencilOutline,
} from 'react-icons/io5'
import { useState, useRef, useEffect } from 'react'
import { useDeleteMessage } from '@/client/hooks/usemessages'

export function ShownMessage({ data, userId }) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const menuRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const message = data
  const deleteMessage = useDeleteMessage()
  //const editMessage = useEditMessage()

  // Close menu on outside click or Escape
  useEffect(() => {
    if (!open) return

    function onPointerDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  // Focus the input and put the cursor at the end when editing starts
  useEffect(() => {
    if (editing && inputRef.current) {
      const el = inputRef.current
      el.focus()
      el.setSelectionRange(el.value.length, el.value.length)
    }
  }, [editing])

  async function handleDelete() {
    setOpen(false)
    await deleteMessage.mutateAsync({ id: message.id })
  }

  function startEdit() {
    setOpen(false)
    setDraft(message.text)
    setEditing(true)
  }

  function cancelEdit() {
    setEditing(false)
    setDraft('')
  }
  /*
  async function saveEdit() {
    const text = draft.trim()
    // Nothing to save: empty or unchanged
    if (!text || text === message.text) {
      cancelEdit()
      return
    }
    setEditing(false)
    await editMessage.mutateAsync({ id: message.id, text })
  }
*/
  function onInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      //saveEdit()
    } else if (e.key === 'Escape') {
      cancelEdit()
    }
  }

  const isOwner = userId == message.senderid && !message.pending
  const canEdit = message.type == 'text'

  return (
    <div
      className={`group flex justify-between gap-4 rounded-md px-2 py-1 transition-colors hover:bg-white/[0.03] ${
        message.pending ? 'opacity-50' : ''
      }`}
    >
      <div className="flex gap-4 flex-1 min-w-0">
        <img
          className="rounded-full w-12 aspect-square h-12 shrink-0"
          alt={`${message.name}'s profile picture`}
          src={message.pfp}
        />
        <div className="flex-1 min-w-0">
          <div className="flex gap-4 items-center">
            <Link to={'/profile/' + message.senderid}>
              <p className="hover:underline">{message.name}</p>
            </Link>
            <p className="text-xs text-zinc-400">
              {new Date(message.date).toLocaleString()}
            </p>
          </div>

          {message.type == 'text' &&
            (editing ? (
              <div className="mt-1">
                <input
                  ref={inputRef}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={onInputKeyDown}
                  className="w-full rounded-md border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-white/30 transition"
                />
                <p className="mt-1.5 text-xs text-zinc-400">
                  escape to{' '}
                  <button
                    onClick={cancelEdit}
                    className="text-sky-400 hover:underline cursor-pointer"
                  >
                    cancel
                  </button>{' '}
                  • enter to{' '}
                  <button
                    //onClick={saveEdit}
                    className="text-sky-400 hover:underline cursor-pointer"
                  >
                    save
                  </button>
                </p>
              </div>
            ) : (
              <p>{message.text}</p>
            ))}

          {message.type == 'img' && (
            <img
              className="max-w-200 w-full rounded-md"
              alt="Sent image"
              src={message.text}
            />
          )}
        </div>
      </div>

      {isOwner && !editing && (
        <div ref={menuRef} className="relative h-min">
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Message options"
            aria-haspopup="menu"
            aria-expanded={open}
            className={`p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer
              ${open ? 'opacity-100 bg-white/10 text-white' : 'opacity-0 group-hover:opacity-100 focus:opacity-100'}`}
          >
            <IoEllipsisVerticalOutline size={18} />
          </button>

          {open && (
            <div
              role="menu"
              className="absolute right-0 top-full mt-1 z-20 w-36 overflow-hidden rounded-lg border border-white/10 bg-zinc-900 p-1 shadow-xl shadow-black/50"
            >
              {canEdit && (
                <button
                  role="menuitem"
                  onClick={startEdit}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-200 hover:bg-white/10 transition cursor-pointer"
                >
                  <IoPencilOutline size={16} />
                  Edit
                </button>
              )}
              <button
                role="menuitem"
                onClick={handleDelete}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition cursor-pointer"
              >
                <IoTrashOutline size={16} />
                Delete
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
