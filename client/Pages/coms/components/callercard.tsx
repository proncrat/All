import { handleImageLoad } from './callHelper'
import { forwardRef } from 'react'

export const CallerCard = forwardRef<HTMLVideoElement>(function CallerCard(
  { data },
  ref,
) {
  return (
    <div className="max-w-150 relative aspect-video bg-transparent transition flex justify-center items-center rounded-sm">
      {data.istalking && (
        <div className="absolute border-3 border-green-500 h-full w-full rounded-sm " />
      )}
      {data.isvideo ? (
        <video
          autoPlay
          ref={ref}
          className="w-full h-full  bg-black rounded-sm"
          type="video/mp4; codecs=hevc"
        />
      ) : (
        <img
          className="w-25 h-25 rounded-full "
          src={data.img}
          alt=""
          onLoad={handleImageLoad}
        />
      )}
    </div>
  )
})
