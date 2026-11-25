import { RefObject, useCallback, useEffect, useRef } from 'react'

// Shows what's playing in the operating system's media controls
// (Windows media overlay, macOS Now Playing, lock screens, media keys)
// via the browser's Media Session API.
//
// Several media elements can use this hook at once (song <audio>, watch-page
// <video>, mini-player <video>). Whichever one most recently started playing
// "owns" the session and gets its metadata + action handlers shown.

export type MediaSessionMeta = {
  title: string
  artist?: string
  album?: string
  artwork?: string | null
}

export type MediaSessionHandlers = Partial<
  Record<MediaSessionAction, (details: MediaSessionActionDetails) => void>
>

const ACTIONS: MediaSessionAction[] = [
  'play',
  'pause',
  'stop',
  'previoustrack',
  'nexttrack',
  'seekto',
  'seekbackward',
  'seekforward',
]

const supported = () =>
  typeof navigator !== 'undefined' && 'mediaSession' in navigator

let owner: HTMLMediaElement | null = null

function release(el: HTMLMediaElement) {
  if (!supported() || owner !== el) return
  owner = null
  const ms = navigator.mediaSession
  ms.metadata = null
  ms.playbackState = 'none'
  for (const a of ACTIONS) {
    try {
      ms.setActionHandler(a, null)
    } catch {
      // action not supported by this browser
    }
  }
}

// relative paths like /images/x.webp must be absolute for the OS to load them
const absolute = (src: string) => new URL(src, window.location.href).href

export function useMediaSession(
  ref: RefObject<HTMLMediaElement | null>,
  meta: MediaSessionMeta | null,
  handlers: MediaSessionHandlers,
) {
  const metaRef = useRef(meta)
  metaRef.current = meta
  const handlersRef = useRef(handlers)
  handlersRef.current = handlers

  const claim = useCallback(() => {
    const el = ref.current
    const m = metaRef.current
    if (!supported() || !el || !m) return
    owner = el
    const ms = navigator.mediaSession
    ms.metadata = new MediaMetadata({
      title: m.title,
      artist: m.artist ?? '',
      album: m.album ?? '',
      artwork: m.artwork ? [{ src: absolute(m.artwork) }] : [],
    })
    for (const a of ACTIONS) {
      try {
        ms.setActionHandler(
          a,
          handlersRef.current[a]
            ? (details) => handlersRef.current[a]?.(details)
            : null,
        )
      } catch {
        // action not supported by this browser
      }
    }
    ms.playbackState = el.paused ? 'paused' : 'playing'
  }, [ref])

  // take the session whenever this element starts playing
  useEffect(() => {
    const el = ref.current
    if (!el || !supported()) return
    const onPlay = () => claim()
    const onPause = () => {
      if (owner === el) navigator.mediaSession.playbackState = 'paused'
    }
    el.addEventListener('play', onPlay)
    el.addEventListener('pause', onPause)
    if (!el.paused) claim()
    return () => {
      el.removeEventListener('play', onPlay)
      el.removeEventListener('pause', onPause)
      release(el)
    }
  }, [ref, claim])

  // keep the shown info current if it changes while we own the session
  useEffect(() => {
    const el = ref.current
    if (!el || owner !== el) return
    if (meta) claim()
    else release(el)
  }, [meta?.title, meta?.artist, meta?.album, meta?.artwork, claim])
}

// play/pause/seek handlers for a plain <video>/<audio> element
export function elementHandlers(
  ref: RefObject<HTMLMediaElement | null>,
): MediaSessionHandlers {
  const el = () => ref.current
  const seekBy = (delta: number) => {
    const e = el()
    if (!e) return
    e.currentTime = Math.min(
      Math.max(0, e.currentTime + delta),
      e.duration || Infinity,
    )
  }
  return {
    play: () => el()?.play().catch(() => {}),
    pause: () => el()?.pause(),
    seekto: (d) => {
      const e = el()
      if (e && d.seekTime != null) e.currentTime = d.seekTime
    },
    seekbackward: (d) => seekBy(-(d.seekOffset ?? 10)),
    seekforward: (d) => seekBy(d.seekOffset ?? 10),
  }
}
