import { useEffect, useRef, useState, useCallback } from 'react'
import { CallerCard } from './callercard'
import { FcEndCall } from 'react-icons/fc'
import { LuScreenShare, LuScreenShareOff } from 'react-icons/lu'
import { BiSolidMicrophone, BiSolidMicrophoneOff } from 'react-icons/bi'
import { FaChevronCircleDown } from 'react-icons/fa'
import { useNewSse } from '@/client/hooks/useCall'
import { useSession } from '@/lib/auth'
import WebRTCCall from './claude'

export function Call({ callback }) {
  //THIS GETS DESKTOP CAPTURE LEL
  const theWindow = useRef(null)

  const [theheight, settheheight] = useState(false)

  //all for the stream
  const [streamingscreen, setstreamingscreen] = useState(false)
  const [streamId, setStreamId] = useState(NaN)
  const [streamVid, setStreamVid] = useState()

  const [people, setpeople] = useState([
    {
      img: 'http://localhost:5173/images/janedoe2.jpg',
      id: 1,
      istalking: false,
      isvideo: false,
      iscamera: false,
    },
    {
      img: 'http://localhost:5173/images/grace.jpg',
      id: 2,
      istalking: false,
      isvideo: false,
      iscamera: false,
    },
  ])

  function ENDDACALL() {
    callback(false)
  }

  async function shareScreenLocal() {
    setstreamingscreen(true)
    const maxId = people.reduce(
      (max, item) => (item.id > max ? item.id : max),
      -Infinity,
    )
    const temp_id = maxId + 1
    leAddVideo(temp_id)
    setStreamId(temp_id)
    try {
      const captureStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      })
      setSource(temp_id, captureStream)

      const videoTrack = captureStream.getVideoTracks()[0]
      setStreamVid(videoTrack)
      videoTrack.addEventListener('ended', () => {
        console.log('User clicked the native stop sharing button.')

        stopStream()
      })
    } catch (err) {
      //one day actual error handling
      console.error('Error capturing screen: ', err)
    }
  }

  function stopStream() {
    leRemoveVideo(streamId)
    setstreamingscreen(false)
    if (streamVid) {
      streamVid.stop()
    }
  }

  // does a thing????
  const videoRefs = useRef(new Map())

  function getMap() {
    return videoRefs.current
  }

  function setSource(id, stream) {
    const node = getMap().get(id)
    console.log(node)
    if (node) node.srcObject = stream
  }

  const leAddVideo = (tempid) => {
    const temp = [...people]
    const video = { id: tempid, isvideo: true }
    console.log(people)
    console.log(temp)
    temp.push(video)
    setpeople(temp)
  }

  const leRemoveVideo = (tempid) => {
    const updatedItems = people.filter((item) => item.id !== tempid)
    setpeople(updatedItems)
  }

  function inflationmax() {
    if (theheight) {
      settheheight(false)
    } else {
      settheheight(true)
    }
  }

  //The change things in lists function
  const talkingtest = (id) => {
    const updatedTasks = people.map((person) => {
      if (person.id === id) {
        return { ...person, istalking: 1 }
      }
      return person
    })
    setpeople(updatedTasks)
  }

  /* ----THE CALLING SECTION CLEANUP WILL BE NECASSARY---- */

  //The exchange for calls using sse?
  const [mysdp, setmysdp] = useState('')
  const [theirsdp, settheirsdp] = useState('')
  const [finalsdp, setfinalsdp] = useState('')

  const ringtone = useRef(null)

  //
  async function testcall() {
    const sdp = await startCall()
    //My vclient id :oiZ6VbOZbNaN1zbtNqk0pubBRyvkq2hS
    //Bros client id : rztLnolAoFGAaevREVdZcUgsv7GXVlEq
    sendCallRequest(
      'rztLnolAoFGAaevREVdZcUgsv7GXVlEq',
      JSON.stringify(sdp),
      'initial',
    )
  }

  async function testanswerCall() {
    const sdp = await acceptCall()
    sendCallRequest(
      'oiZ6VbOZbNaN1zbtNqk0pubBRyvkq2hS',
      JSON.stringify(sdp),
      'final',
    )
  }

  function letest() {
    if (pcRef.current) {
      console.log('Current Connection State ' + pcRef.current.connectionState)
    }
  }

  const { data: session, isPending: seshpend } = useSession()
  const ssemessage = useNewSse()

  //sends sdp request to other client
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
          console.log('Received targeted message:', data)
          submitAnswer(data.offer)
        } else {
          console.log('Received targeted message:', data)
          settheirsdp(data.offer)
          //console.log(theirsdp)
          //ringtone.current.play()
        }
      }
    }

    // Handle connection errors
    eventSource.onerror = (err) => {
      console.error('SSE Connection failed:', err)
    }
  }, [seshpend, session])

  //THIS STUFF IS FOR THE CALL IT SELF

  const ICE_SERVERS = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  }

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
    <div
      ref={theWindow}
      className={`absolute bg-[#11001cf4] w-[stretch] flex flex-col gap-4 p-6 z-10 items-center ${
        theheight && 'h-full'
      }`}
    >
      {/* eslint-disable-next-line jsx-a11y/media-has-caption*/}
      <audio className="hidden" ref={ringtone}>
        <source src="/audio/Over_the_Horizon.ogg" type="audio/ogg" />
      </audio>
      <div
        className="grid gap-2 p-2 h-full
            grid-cols-[repeat(auto-fit,minmax(300px,1fr))]
            auto-rows-fr w-full"
      >
        <video ref={remoteVideoRef} autoPlay></video>
        {people.map((person) => (
          <CallerCard
            key={person.id}
            data={person}
            ref={(node) => {
              const map = getMap()
              if (node) {
                map.set(person.id, node)
              } else {
                map.delete(person.id)
              }
            }}
          />
        ))}
      </div>
      <div className="flex justify-center gap-4 bg-cyan-400 p-2 rounded-sm max-w-fit">
        {streamingscreen ? (
          <button
            onClick={stopStream}
            className="bg-amber-950 px-2 rounded-sm cursor-pointer"
          >
            <LuScreenShareOff />
          </button>
        ) : (
          <button
            onClick={shareScreenLocal}
            className="bg-amber-950 px-2 rounded-sm cursor-pointer"
          >
            <LuScreenShare />
          </button>
        )}
        {micOn ? (
          <button
            onClick={toggleMic}
            className="bg-amber-950 px-2 rounded-sm cursor-pointer"
          >
            <BiSolidMicrophone />
          </button>
        ) : (
          <button
            onClick={toggleMic}
            className="bg-amber-950 px-2 rounded-sm cursor-pointer"
          >
            <BiSolidMicrophoneOff />
          </button>
        )}

        <button
          onClick={ENDDACALL}
          className="bg-amber-950 px-2 rounded-sm cursor-pointer"
        >
          <FcEndCall />
        </button>
        <button
          onClick={inflationmax}
          className="bg-amber-950 px-2 rounded-sm cursor-pointer"
        >
          <FaChevronCircleDown />
        </button>
        <button
          onClick={testcall}
          className="bg-amber-950 px-2 rounded-sm cursor-pointer"
        >
          Test call
        </button>
        <button
          onClick={testanswerCall}
          className="bg-amber-950 px-2 rounded-sm cursor-pointer"
        >
          Answer? call
        </button>
        <button
          onClick={letest}
          className="bg-amber-950 px-2 rounded-sm cursor-pointer"
        >
          test
        </button>
      </div>
    </div>
  )
}
