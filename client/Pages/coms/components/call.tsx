import { useRef, useState } from 'react'
import { prominent } from 'color.js'

export function Call() {
  //THIS GETS DESKTOP CAPTURE LEL
  const testVideo = useRef(null)
  const theWindow = useRef(null)

  const [theheight, settheheight] = useState(false)

  async function THESTREAM() {
    try {
      // Request permission and get the video stream
      const captureStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false, // Set to true if you need to capture system audio
      })

      // Bind the stream to the HTML video element
      testVideo.current.srcObject = captureStream
    } catch (err) {
      console.error('Error capturing screen: ', err)
    }
  }

  function inflationmax() {
    if (theheight) {
      settheheight(false)
    } else {
      settheheight(true)
    }
  }

  const handleImageLoad = async (event) => {
    //console.log('Image loaded successfully!', event.target)
    const color = await prominent(event.target, {
      format: 'hex',
    })
    console.log(event.target.parent)
    event.target.parentElement.style.backgroundColor = color[0]
  }

  return (
    <div
      ref={theWindow}
      className={`absolute bg-[#2a006399] w-[stretch] flex flex-col gap-4 p-6 z-10 ${
        theheight && 'h-full'
      }`}
    >
      <div className="justify-center gap-6 flex">
        <div className=" relative w-full aspect-video bg-transparent transition flex justify-center items-center rounded-sm">
          <div className="absolute border-3 border-green-500 h-full w-full rounded-sm " />
          <img
            className="w-25 h-25 rounded-full "
            src="http://localhost:5173/images/janedoe2.jpg"
            alt=""
            onLoad={handleImageLoad}
          />
        </div>
        <div className="relative w-full aspect-video bg-transparent flex justify-center items-center rounded-sm">
          <img
            className="w-25 h-25 rounded-full"
            src="http://localhost:5173/images/grace.jpg"
            alt=""
            onLoad={handleImageLoad}
          />
        </div>
        {/*<video autoPlay ref={testVideo} className="w-full" />*/}
      </div>
      <div className="flex justify-center gap-4">
        <button
          onClick={THESTREAM}
          className="bg-amber-950 px-2 rounded-sm cursor-pointer"
        >
          STREAM SCREEN?
        </button>
        <button className="bg-amber-950 px-2 rounded-sm cursor-pointer">
          END CALL
        </button>
        <button
          onClick={inflationmax}
          className="bg-amber-950 px-2 rounded-sm cursor-pointer"
        >
          Make it big
        </button>
      </div>
    </div>
  )
}
