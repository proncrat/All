import { useRef } from 'react'

export function Call() {
  //THIS GETS DESKTOP CAPTURE LEL
  const testVideo = useRef(null)

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

  return (
    <div className="absolute bg-[#2a006399] w-[stretch] flex flex-col gap-4 p-6">
      <div className="justify-center gap-6 flex">
        <img
          className="w-45"
          src="https://www.eatingwell.com/thmb/5pRGCnuxy6aEEUUmibA3mid6EkM=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/EWL-Steamed-Fresh-Green-Beans-1x1-022_preview_maxWidth_4000_maxHeight_4000_ppi_300_quality_100-f3382e02472247a5be27451fdbade752.jpg"
          alt=""
        ></img>
        <img
          className="w-45"
          src="https://www.eatingwell.com/thmb/5pRGCnuxy6aEEUUmibA3mid6EkM=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/EWL-Steamed-Fresh-Green-Beans-1x1-022_preview_maxWidth_4000_maxHeight_4000_ppi_300_quality_100-f3382e02472247a5be27451fdbade752.jpg"
          alt=""
        ></img>
        <video autoPlay ref={testVideo} className="w-45" />
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
      </div>
    </div>
  )
}
