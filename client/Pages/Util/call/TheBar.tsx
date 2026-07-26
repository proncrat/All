import { useEffect, useRef, useState } from 'react'
import { getSharedAudioContext } from '../audioContext'

export function TheBar({ isListening }) {
  const localStreamRef = useRef(null)

  const getMedia = async () => {
    const constraints = {
      video: false,
      audio: {
        autoGainControl: false, // Prevents the browser from auto-adjusting levels
        noiseSuppression: false, // Disables background noise clearing
        echoCancellation: false, // Disables echo feedback loops
      },
    }
    const stream = await navigator.mediaDevices.getUserMedia(constraints)
    localStreamRef.current = stream
    return stream
  }

  const [volume, setVolume] = useState(0)

  useEffect(() => {
    if (!isListening) return

    let cancelled = false
    let analyser
    let dataArray
    let source
    let stream
    let animationId
    const audioContext = getSharedAudioContext()

    async function setupAudio() {
      try {
        stream = await getMedia()
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }

        analyser = audioContext.createAnalyser()
        analyser.fftSize = 256

        source = audioContext.createMediaStreamSource(stream)
        source.connect(analyser)
        // note: do NOT connect analyser to audioContext.destination —
        // you don't want to route the mic to speakers

        dataArray = new Uint8Array(analyser.frequencyBinCount)

        function updateVolume() {
          if (cancelled) return
          analyser.getByteFrequencyData(dataArray)
          let sum = 0
          for (let i = 0; i < dataArray.length; i++) sum += dataArray[i]
          setVolume(Math.round(sum / dataArray.length))
          animationId = requestAnimationFrame(updateVolume)
        }

        animationId = requestAnimationFrame(updateVolume)
      } catch (err) {
        console.error('Microphone access denied or not supported', err)
        setIsListening(false)
      }
    }

    setupAudio()

    return () => {
      cancelled = true
      cancelAnimationFrame(animationId)
      if (source) source.disconnect()
      // don't close the shared context here — other features may still need it
      if (stream) stream.getTracks().forEach((track) => track.stop())
    }
  }, [isListening])

  return (
    <div>
      {isListening && (
        <div className="mt-2 rounded-full bg-gray-700 w-full h-1">
          <div
            className="rounded-full bg-green-500 h-full"
            style={{
              width: `${Math.min(volume * 2, 200)}px`,
            }}
          />
        </div>
      )}
    </div>
  )
}
