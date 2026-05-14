export function PfBg({ src }) {
  return (
    <div>
      {src && (
        <div className="absolute top-0 left-0 w-full -z-10">
          <div className=" relative after:content-[''] after:absolute after:w-full after:h-full after:bg-[linear-gradient(0deg,var(--after-color,black),rgba(255,255,255,0)_50%)] after:pointer-events-none after:top-0 after:left-0">
            <img className="w-full relative -z-10" alt="bg" src={src.bg}></img>
          </div>
        </div>
      )}
    </div>
  )
}
