import { useState } from 'react'

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

export function PfBg({ src }: { src?: { bg?: string } }) {
  if (!src?.bg) return null

  return (
    <div className="absolute top-0 left-0 w-full -z-10">
      <div className="relative after:content-[''] after:absolute after:w-full after:h-full after:bg-[linear-gradient(0deg,var(--after-color,black),rgba(255,255,255,0)_50%)] after:pointer-events-none after:top-0 after:left-0">
        <BgImage key={src.bg} url={src.bg} />
      </div>
    </div>
  )
}
