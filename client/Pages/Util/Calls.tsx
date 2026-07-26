import { useNewSse } from '@/client/hooks/useCall'
import { useSession } from '@/lib/auth'
import { useCallback, useEffect, useRef, useState } from 'react'
import { BiSolidMicrophone, BiSolidMicrophoneOff } from 'react-icons/bi'
import { TbHeadphonesOff, TbHeadphones } from 'react-icons/tb'

export function CallingStuffs() {
  //----------------WEb rtx logic----------------------------

  const ICE_SERVERS = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  }

  const [initialsdp, setinitialsdp] = useState('')
  const [responsesdp, setresponsesdp] = useState('')
  const [finalsdp, setfinalsdp] = useState('')

  //calling
  const [phase, setPhase] = useState('idle') // idle | ready | calling | connected
  const [offerSDP, setOfferSDP] = useState('')
  const [answerSDP, setAnswerSDP] = useState('')
  const [remoteInput, setRemoteInput] = useState('')
  const [camOn, setCamOn] = useState(true)
  const [error, setError] = useState('')

  const pcRef = useRef(null)
  const localStreamRef = useRef(null)
  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)

  const cleanup = useCallback(() => {
    if (pcRef.current) {
      pcRef.current.close()
      pcRef.current = null
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop())
      localStreamRef.current = null
    }
    if (localVideoRef.current) localVideoRef.current.srcObject = null
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null
    setPhase('idle')
    setOfferSDP('')
    setAnswerSDP('')
    setRemoteInput('')
    setError('')
  }, [])

  useEffect(() => () => cleanup(), [cleanup])

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
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream
    }
    return stream
  }

  const buildPC = (stream) => {
    const pc = new RTCPeerConnection(ICE_SERVERS)
    pcRef.current = pc

    stream.getTracks().forEach((track) => pc.addTrack(track, stream))

    pc.ontrack = (e) => {
      if (remoteVideoRef.current && e.streams[0]) {
        remoteVideoRef.current.srcObject = e.streams[0]
        setPhase('connected')
      }
    }

    pc.oniceconnectionstatechange = () => {
      if (
        pc.iceConnectionState === 'disconnected' ||
        pc.iceConnectionState === 'failed'
      ) {
        setError('Connection lost.')
        setPhase('ready')
      }
    }

    return pc
  }

  const startCall = async () => {
    setError('')
    try {
      const stream = await getMedia()
      const pc = buildPC(stream)
      setPhase('calling')

      // Gather all ICE candidates before sharing (trickle-less for simplicity)
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      //console.log(pc.localDescription)
      //setOfferSDP(pc.localDescription)

      await Promise.race([
        new Promise<void>((resolve) => {
          if (pc.iceGatheringState === 'complete') return resolve()
          pc.onicegatheringstatechange = () => {
            if (pc.iceGatheringState === 'complete') resolve()
          }
        }),
        new Promise<void>((resolve) => setTimeout(resolve, 2000)), // give up after 2s, use whatever candidates you have
      ])
      console.log('Current Connection State ' + pc.connectionState)
      return pc.localDescription
      /*
      await new Promise((resolve) => {
        if (pc.iceGatheringState === 'complete') return resolve()
        pc.onicegatheringstatechange = () => {
          if (pc.iceGatheringState === 'complete') resolve()
        }
      })
*/
    } catch (e) {
      setError(e.message)
      setPhase('idle')
    }
  }

  //For me not for thee
  const submitAnswer = async (sdp) => {
    setError('')
    try {
      const answer = JSON.parse(sdp)
      await pcRef.current.setRemoteDescription(
        new RTCSessionDescription(answer),
      )
    } catch (e) {
      setError('Invalid answer SDP: ' + e.message)
    }
  }

  //for the other person to accept
  const acceptCall = async () => {
    setError('')
    try {
      const offer = JSON.parse(initialsdp)
      const stream = await getMedia()
      const pc = buildPC(stream)
      setPhase('calling')

      await pc.setRemoteDescription(new RTCSessionDescription(offer))
      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)

      await Promise.race([
        new Promise<void>((resolve) => {
          if (pc.iceGatheringState === 'complete') return resolve()
          pc.onicegatheringstatechange = () => {
            if (pc.iceGatheringState === 'complete') resolve()
          }
        }),
        new Promise<void>((resolve) => setTimeout(resolve, 2000)), // give up after 2s, use whatever candidates you have
      ])
      setAnswerSDP(JSON.stringify(pc.localDescription))
      setRemoteInput('')
      return pc.localDescription
    } catch (e) {
      setError('Failed to accept: ' + e.message)
      setPhase('idle')
    }
  }

  //-----------------------The talking indicators--------------------

  const [volume, setVolume] = useState(0)
  const [talking, settalking] = useState(false)
  const [isListening, setIsListening] = useState(false)

  const [talkingbar1, settalkingbar1] = useState(false)
  const [talkingbar2, settalkingbar2] = useState(true)

  useEffect(() => {
    if (!isListening) return

    let audioContext
    let analyser
    let dataArray
    let source
    let animationId

    async function setupAudio() {
      try {
        const stream = await getMedia()
        audioContext = new (window.AudioContext || window.webkitAudioContext)()
        analyser = audioContext.createAnalyser()
        analyser.fftSize = 256

        source = audioContext.createMediaStreamSource(stream)
        source.connect(analyser)

        dataArray = new Uint8Array(analyser.frequencyBinCount)

        function updateVolume() {
          analyser.getByteFrequencyData(dataArray)
          let sum = 0
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i]
          }
          const average = sum / dataArray.length
          setVolume(Math.round(average))
          animationId = requestAnimationFrame(updateVolume)
        }

        updateVolume()
      } catch (err) {
        console.error('Microphone access denied or not supported', err)
        setIsListening(false)
      }
    }

    setupAudio()

    return () => {
      cancelAnimationFrame(animationId)
      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close()
      }
    }
  }, [isListening])

  //-----------------deaf/mute-------------------

  const [deafen, setDeafen] = useState(true)
  const [mute, setmute] = useState(true)

  //Kinda stupid, will fix later?
  function setGlobalDOMVolume(volumeLevel: number) {
    // volumeLevel must be a number between 0.0 and 1.0
    const allAudios = document.querySelectorAll('audio, video')
    allAudios.forEach((media) => {
      media.volume = volumeLevel
    })
  }

  async function setMicVolume() {
    const track = localStreamRef.current?.getAudioTracks()[0]
    if (track) {
      track.enabled = !track.enabled
    }
  }

  const toggleDeafen = () => {
    if (deafen) {
      setGlobalDOMVolume(0)
    } else {
      setGlobalDOMVolume(1)
    }
    setDeafen((v) => !v)
  }

  const toggleMute = () => {
    if (deafen) {
      setMicVolume()
    }
    setmute((v) => !v)
  }

  //----------------------call interface stuffs----------------------
  const [connectionStatus, setconnectionStatus] = useState('null')

  const [incomingCall, setincomingCall] = useState(false)
  const [inCall, setinCall] = useState(false)

  const ringtone = useRef(null)

  const { data: session, isPending: seshpend } = useSession()

  useEffect(() => {
    const myClientId = session?.user.id

    const eventSource = new EventSource(
      `http://localhost:3000/api/v1/test/events?clientId=${myClientId}`,
    )

    // Listen for incoming messages targeting this client
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data)

      if (data.type == 'call') {
        if (data.order == 'final') {
          //Need this lul
          //submitAnswer(data.offer)
        } else if (data.order == 'initial') {
          setinitialsdp(data.offer)
          if (ringtone) {
            ringtone.current.currentTime = 0
            ringtone.current.volume = 0.2
            ringtone.current.play()
            setincomingCall(true)
          }
        }
      }
    }

    // Handle connection errors
    eventSource.onerror = (err) => {
      console.error('SSE Connection failed:', err)
    }
  }, [seshpend, session])

  async function AcceptCall() {
    ringtone.current.pause()
    setincomingCall(false)
    setinCall(true)
    const sdp = await acceptCall()
    sendCallRequest(
      'oiZ6VbOZbNaN1zbtNqk0pubBRyvkq2hS',
      JSON.stringify(sdp),
      'final',
    )
    letest()
  }

  function DeclineCall() {
    ringtone.current.pause()
    setincomingCall(false)
  }

  function HangUpCall() {
    setinCall(false)
  }

  //----------------Com to other client---------------------

  const ssemessage = useNewSse()

  async function sendCallRequest(
    id: string,
    sdpthing?: string,
    order?: string,
  ) {
    const data = {
      targetClientId: id,
      message: { type: 'call', order: order, offer: sdpthing },
    }

    await ssemessage.mutateAsync(data)
  }

  function letest() {
    if (pcRef.current) {
      setconnectionStatus(pcRef.current.connectionState)
    }
  }

  return (
    <div className={`fixed z-50 bottom-0 `}>
      {/*<div className={`fixed z-50 bottom-0 ${!isActive2 && 'hidden'} `}>*/}

      <div style={{ padding: '20px' }}>
        <button onClick={() => setIsListening(!isListening)}>
          {isListening ? 'Stop Listening' : 'Start Listening'}
        </button>
      </div>
      <div className="bg-black m-5 p-2 rounded-sm">
        <audio className="hidden" ref={ringtone}>
          <source src="/audio/Over_the_Horizon.ogg" type="audio/ogg" />
        </audio>

        {incomingCall && (
          <div className="mb-3 flex justify-between border-b pb-2">
            <p>God calling</p>
            <div className="flex gap-4">
              <button onClick={AcceptCall}>✓</button>
              <button onClick={DeclineCall}>X</button>
            </div>
          </div>
        )}

        {inCall && (
          <div className="mb-3 flex justify-between border-b pb-2">
            <p>{connectionStatus}</p>
            <div className="flex gap-4">
              <button onClick={HangUpCall}>X</button>
            </div>
          </div>
        )}

        <div className="flex gap-14">
          <div className="flex gap-3">
            <div className="relative">
              {talkingbar1 && volume > 0 && (
                <div className="absolute border-3 border-green-500 h-full w-full rounded-full " />
              )}

              <img
                alt="img"
                className="rounded-full aspect-square w-10"
                src={session?.user.image}
              />
            </div>
            <div>
              <p>God</p>
              <p className="text-gray-400 text-xs">doing thing</p>
            </div>
          </div>
          <div className="flex gap-2">
            {mute ? (
              <button
                onClick={toggleMute}
                className="px-2 rounded-sm cursor-pointer hover:bg-gray-900"
              >
                <BiSolidMicrophone size={'20px'} />
              </button>
            ) : (
              <button
                onClick={toggleMute}
                className="bg-red-700 px-2 rounded-sm cursor-pointer"
              >
                <BiSolidMicrophoneOff size={'20px'} />
              </button>
            )}
            {deafen ? (
              <button
                onClick={toggleDeafen}
                className="px-2 rounded-sm cursor-pointer hover:bg-gray-900"
              >
                <TbHeadphones size={'20px'} />
              </button>
            ) : (
              <button
                onClick={toggleDeafen}
                className="bg-red-700 px-2 rounded-sm cursor-pointer"
              >
                <TbHeadphonesOff size={'20px'} />
              </button>
            )}
          </div>
        </div>
        {talkingbar2 && (
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
    </div>
  )
}
