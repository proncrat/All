import { useSession } from '@/lib/auth'
import { useCallback, useEffect, useRef, useState } from 'react'

export function CallingStuffs() {
  const [initialsdp, setinitialsdp] = useState('')
  const [finalsdp, setfinalsdp] = useState('')

  const ringtone = useRef(null)
  const [isActive2, setIsActive2] = useState(false)

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
          ringtone.current.currentTime = 0
          ringtone.current.volume = 0.4
          ringtone.current.play()
          setIsActive2(true)
        }
      }
    }

    // Handle connection errors
    eventSource.onerror = (err) => {
      console.error('SSE Connection failed:', err)
    }
  }, [seshpend, session])

  function DeclineCall() {
    ringtone.current.pause()
    setIsActive2(false)
  }

  //calling
  const [phase, setPhase] = useState('idle') // idle | ready | calling | connected
  const [offerSDP, setOfferSDP] = useState('')
  const [answerSDP, setAnswerSDP] = useState('')
  const [remoteInput, setRemoteInput] = useState('')
  const [micOn, setMicOn] = useState(true)
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
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    })
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
      const offer = JSON.parse(theirsdp)
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

      /*
      await new Promise((resolve) => {
        if (pc.iceGatheringState === 'complete') return resolve()
        pc.onicegatheringstatechange = () => {
          if (pc.iceGatheringState === 'complete') resolve()
        }
      })
*/
      //setAnswerSDP(JSON.stringify(pc.localDescription))
      setRemoteInput('')
      return pc.localDescription
    } catch (e) {
      setError('Failed to accept: ' + e.message)
      setPhase('idle')
    }
  }

  const toggleMic = () => {
    const track = localStreamRef.current?.getAudioTracks()[0]
    if (track) {
      track.enabled = !track.enabled
      setMicOn((v) => !v)
    }
  }

  const toggleCam = () => {
    const track = localStreamRef.current?.getVideoTracks()[0]
    if (track) {
      track.enabled = !track.enabled
      setCamOn((v) => !v)
    }
  }

  const isActive = phase === 'calling' || phase === 'connected'
  const statusMap = {
    idle: 'Ready to connect',
    ready: 'Media acquired',
    calling: 'Exchanging signals…',
    connected: 'Connected',
  }

  return (
    <div className={`fixed z-50 bottom-0 ${!isActive2 && 'hidden'} `}>
      <div className="bg-black m-5 p-4 rounded-sm">
        <audio className="hidden" ref={ringtone}>
          <source src="/audio/Over_the_Horizon.ogg" type="audio/ogg" />
        </audio>
        <audio />
        <div className="flex gap-3">
          <p>Incoming call</p>
          <button className="cursor-pointer">✓</button>
          <button onClick={DeclineCall} className="cursor-pointer">
            X
          </button>
        </div>
      </div>
    </div>
  )
}
