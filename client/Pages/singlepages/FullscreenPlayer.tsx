import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  IoPlaySkipBackSharp,
  IoPlaySkipForwardSharp,
  IoPlaySharp,
  IoPauseSharp,
  IoVolumeHighSharp,
  IoVolumeLowSharp,
  IoVolumeMuteSharp,
  IoContractSharp,
} from 'react-icons/io5'
import { usePlayer } from '../Main/PlayerContext'

const IDLE_MS = 2500

function fmt(s) {
  if (!Number.isFinite(s)) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

export default function FullscreenPlayer({ onClose }) {
  const { audioRef, current, playing, toggle, next, prev } = usePlayer()

  const rootRef = useRef(null)
  const barRef = useRef(null)
  const idleTimer = useRef(null)
  const scrubbing = useRef(false)
  // latest onClose without making effects depend on it (it's a new function every render)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  const [active, setActive] = useState(true)
  const [cur, setCur] = useState(0)
  const [dur, setDur] = useState(0)
  const [volume, setVolume] = useState(100) // 0-100
  const [muted, setMuted] = useState(false)

  const progress = dur ? Math.min(100, (cur / dur) * 100) : 0

  // --- show controls on mouse move, hide after a short idle period ---
  function wake() {
    setActive(true)
    clearTimeout(idleTimer.current)
    idleTimer.current = setTimeout(() => setActive(false), IDLE_MS)
  }

  useEffect(() => {
    wake()
    return () => clearTimeout(idleTimer.current)
  }, [])

  // --- native fullscreen: enter on mount, leave on unmount, close when the user exits ---
  useEffect(() => {
    const root = rootRef.current
    root?.focus()
    root?.requestFullscreen?.().catch(() => {}) // overlay still works if denied

    const onChange = () => {
      if (!document.fullscreenElement) onCloseRef.current()
    }
    document.addEventListener('fullscreenchange', onChange)

    const onKey = (e) => {
      if (e.key === 'Escape') onCloseRef.current()
    }
    window.addEventListener('keydown', onKey)

    return () => {
      document.removeEventListener('fullscreenchange', onChange)
      window.removeEventListener('keydown', onKey)
      if (document.fullscreenElement)
        document.exitFullscreen?.().catch(() => {})
    }
  }, [])

  // --- follow the shared <audio> element (same one the miniplayer uses) ---
  useEffect(() => {
    const el = audioRef.current
    if (!el) return

    const sync = () => {
      setDur(el.duration || 0)
      if (!scrubbing.current) setCur(el.currentTime)
    }
    const onVol = () => {
      setVolume(Math.round(el.volume * 100))
      setMuted(el.muted)
    }

    el.addEventListener('timeupdate', sync)
    el.addEventListener('loadedmetadata', sync)
    el.addEventListener('durationchange', sync)
    el.addEventListener('volumechange', onVol)
    sync()
    onVol()
    return () => {
      el.removeEventListener('timeupdate', sync)
      el.removeEventListener('loadedmetadata', sync)
      el.removeEventListener('durationchange', sync)
      el.removeEventListener('volumechange', onVol)
    }
  }, [audioRef])

  // --- seeking (click or drag), seeks once on release ---
  function previewSeek(e) {
    const rect = barRef.current.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
    const t = ratio * (audioRef.current?.duration || 0)
    setCur(t)
    return t
  }

  function scrubStart(e) {
    if (!audioRef.current?.duration) return
    scrubbing.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
    previewSeek(e)
  }

  function scrubMove(e) {
    if (scrubbing.current) previewSeek(e)
  }

  function scrubEnd(e) {
    if (!scrubbing.current) return
    audioRef.current.currentTime = previewSeek(e)
    scrubbing.current = false
  }

  // --- volume ---
  function changeVolume(e) {
    const el = audioRef.current
    if (!el) return
    el.volume = Number(e.target.value) / 100
    el.muted = false
  }

  function toggleMute() {
    const el = audioRef.current
    if (el) el.muted = !el.muted
  }

  const bg = current?.background ?? current?.cover
  const VolIcon =
    muted || volume === 0
      ? IoVolumeMuteSharp
      : volume < 50
        ? IoVolumeLowSharp
        : IoVolumeHighSharp

  const iconBtn =
    'rounded-full p-2 text-white/80 transition hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white'

  return createPortal(
    <div
      ref={rootRef}
      tabIndex={0}
      onMouseMove={wake}
      onTouchStart={wake}
      onKeyDown={(e) => {
        wake()
        if (e.code === 'Space' && e.target === e.currentTarget) {
          e.preventDefault()
          toggle()
        }
      }}
      className={`fixed inset-0 z-50 overflow-hidden bg-black text-white outline-none select-none ${
        active ? '' : 'cursor-none'
      }`}
    >
      {/* Background image */}
      {bg && (
        <img
          key={bg}
          src={bg}
          alt=""
          className="absolute inset-0 h-full w-full scale-110 object-cover blur-sm"
        />
      )}
      <div className="absolute inset-0 bg-black/45" />

      {/* Exit button (top right, with controls) */}
      <button
        onClick={onClose}
        aria-label="Exit fullscreen"
        className={`${iconBtn} absolute right-6 top-6 z-20 transition-opacity duration-500 sm:right-12 ${
          active ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <IoContractSharp size={24} />
      </button>

      {/* Bottom-left cover + title (always visible, lifts above controls when shown) */}
      <div
        className={`absolute left-6 z-10 flex max-w-[calc(100vw-3rem)] items-end gap-5 transition-all duration-500 sm:left-12 ${
          active ? 'bottom-32 sm:bottom-36' : 'bottom-8 sm:bottom-12'
        }`}
      >
        {current?.cover && (
          <img
            src={current.cover}
            alt={current.title ? `${current.title} cover` : 'Cover'}
            className="aspect-square w-24 shrink-0 rounded-xl object-cover shadow-2xl shadow-black/60 sm:w-40"
          />
        )}
        <div className="min-w-0 pb-1">
          <h1 className="truncate text-2xl font-semibold tracking-tight sm:text-4xl">
            {current?.title ?? 'Nothing playing'}
          </h1>
          {current?.artist && (
            <p className="mt-1 truncate text-base text-white/70 sm:text-lg">
              {current.artist}
            </p>
          )}
        </div>
      </div>

      {/* Controls (visible only while the mouse is moving) */}
      <div
        className={`absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-6 pb-8 pt-20 transition-opacity duration-500 sm:px-12 ${
          active ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Buttons (left) */}
          <div className="flex shrink-0 items-center gap-1 sm:gap-3">
            <button
              onClick={prev}
              aria-label="Previous track"
              className={iconBtn}
            >
              <IoPlaySkipBackSharp size={28} />
            </button>
            <button
              onClick={toggle}
              aria-label={playing ? 'Pause' : 'Play'}
              className="grid h-12 w-12 place-items-center rounded-full bg-white text-black transition hover:scale-105 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:h-16 sm:w-16"
            >
              {playing ? <IoPauseSharp size={30} /> : <IoPlaySharp size={30} />}
            </button>
            <button onClick={next} aria-label="Next track" className={iconBtn}>
              <IoPlaySkipForwardSharp size={28} />
            </button>
          </div>

          {/* Timeline (fills the rest) */}
          <div className="flex min-w-0 flex-1 items-center gap-3 text-sm tabular-nums text-white/80 sm:gap-4">
            <span className="w-10 text-right">{fmt(cur)}</span>
            <div
              ref={barRef}
              onPointerDown={scrubStart}
              onPointerMove={scrubMove}
              onPointerUp={scrubEnd}
              onPointerCancel={scrubEnd}
              className="group relative h-4 flex-1 cursor-pointer touch-none"
              role="slider"
              aria-label="Seek"
              aria-valuemin={0}
              aria-valuemax={Math.round(dur)}
              aria-valuenow={Math.round(cur)}
            >
              <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-white/25 transition-all group-hover:h-1.5">
                <div
                  className="h-full rounded-full bg-white"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div
                className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white opacity-0 shadow transition-opacity group-hover:opacity-100"
                style={{ left: `${progress}%` }}
              />
            </div>
            <span className="w-10">{fmt(dur)}</span>
          </div>

          {/* Volume (right) */}
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <button
              onClick={toggleMute}
              aria-label={muted ? 'Unmute' : 'Mute'}
              className={iconBtn}
            >
              <VolIcon size={24} />
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={muted ? 0 : volume}
              onChange={changeVolume}
              aria-label="Volume"
              className="hidden h-1 w-24 cursor-pointer accent-white sm:block"
            />
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
