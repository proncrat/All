import { useEffect, useRef, useState } from 'react'

function BgImage({ url }: { url: string }) {
  const [loaded, setLoaded] = useState(false)

  return (
    <img
      ref={(img) => {
        // image was already cached and finished loading before onLoad attached
        if (img?.complete && img.naturalWidth > 0) setLoaded(true)
      }}
      src={url}
      alt=""
      onLoad={() => setLoaded(true)}
      className={`w-full transition-opacity duration-1000 motion-reduce:transition-none ${
        loaded ? 'opacity-100' : 'opacity-0'
      }`}
    />
  )
}

export function PfBg({
  src,
  speed = 0.5,
}: {
  src?: { bg?: string }
  speed?: number
}) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const bg = src?.bg

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let raf = 0
    const update = () => {
      raf = 0
      el.style.transform = `translate3d(0, ${window.scrollY * (1 - speed)}px, 0)`
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [speed, bg]) // re-run once the bg (and therefore the wrapper) exists

  if (!bg) return null

  return (
    <div
      ref={wrapRef}
      className="absolute top-0 left-0 w-full -z-10 will-change-transform"
    >
      <div className="relative after:content-[''] after:absolute after:w-full after:h-full after:bg-[linear-gradient(0deg,var(--after-color,black),rgba(255,255,255,0)_50%)] after:pointer-events-none after:top-0 after:left-0">
        <BgImage key={bg} url={bg} />
      </div>
    </div>
  )
}
