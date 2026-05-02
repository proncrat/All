export function PfBg({ src }) {
  return (
    <div>
      {src && (
        <div className="bgcontainerthing -z-10">
          <div className="bginnercont">
            <img className="w-full relative -z-10" alt="bg" src={src.bg}></img>
          </div>
        </div>
      )}
    </div>
  )
}
