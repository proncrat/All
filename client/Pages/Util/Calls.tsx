import { useNewSse, useStatusChange } from '@/client/hooks/useCall'
import { useSession } from '@/lib/auth'
import { useCallback, useEffect, useRef, useState } from 'react'
import { BiSolidMicrophone, BiSolidMicrophoneOff } from 'react-icons/bi'
import { TbHeadphonesOff, TbHeadphones } from 'react-icons/tb'
import { getSharedAudioContext } from './audioContext'
import { TheBar } from './call/TheBar'

export function CallingStuffs({ callrequest, callcleanup }) {
  //----------------WEb rtx logic----------------------------

  const ICE_SERVERS = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  }

  const [connectionStatus, setconnectionStatus] = useState('null')
  const [otherusername, setotherusername] = useState('')

  const [otherID, setotherID] = useState('')

  const [initialsdp, setinitialsdp] = useState('')
  const [responsesdp, setresponsesdp] = useState('')
  const [finalsdp, setfinalsdp] = useState('')

  //calling
  const [offerSDP, setOfferSDP] = useState('')
  const [answerSDP, setAnswerSDP] = useState('')
  const [remoteInput, setRemoteInput] = useState('')
  const [camOn, setCamOn] = useState(true)
  const [error, setError] = useState('')

  const pcRef = useRef(null)
  const localStreamRef = useRef(null)
  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)

  const remoteAudioRef = useRef(null)

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
    setOfferSDP('')
    setAnswerSDP('')
    setRemoteInput('')
    setError('')
    setconnectionStatus('')
    callcleanup('')
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

    //adds strem to ref
    pc.ontrack = (e) => {
      if (remoteAudioRef.current && e.streams[0]) {
        remoteAudioRef.current.srcObject = e.streams[0]
      }
    }

    pc.onconnectionstatechange = () => {
      letest()
    }

    return pc
  }

  const startCall = async () => {
    setError('')
    try {
      const stream = await getMedia()
      const pc = buildPC(stream)

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
    } catch (e) {
      setError(e.message)
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
    }
  }

  //-----------------------The talking indicators--------------------

  const [volume, setVolume] = useState(0)
  const [isListening, setIsListening] = useState(false)

  const [talkingbar1, settalkingbar1] = useState(false)

  //-----------------deaf/mute-------------------

  const [deafen, setDeafen] = useState(true)
  const [mute, setmute] = useState(true)

  const mutesound = new Audio('/audio/mute.mp3')
  const unmutesound = new Audio('/audio/unmute.mp3')

  const deafensound = new Audio('/audio/deafen.mp3')
  const undeafensound = new Audio('/audio/undeafen.mp3')

  async function setMicVolume() {
    const track = localStreamRef.current?.getAudioTracks()[0]
    if (track) {
      track.enabled = !track.enabled
    }
  }

  const toggleDeafen = () => {
    if (remoteAudioRef.current) {
      remoteAudioRef.current.muted = !remoteAudioRef.current.muted
    }

    if (deafen) {
      deafensound.play()
      setmute(false)
    }
    if (!deafen) {
      undeafensound.play()
      setmute(true)
    }
    setDeafen((v) => !v)
  }

  const toggleMute = () => {
    if (deafen) {
      setMicVolume()
    }
    if (mute) {
      mutesound.play()
    }
    if (!mute) {
      unmutesound.play()
    }
    setmute((v) => !v)
  }

  //----------------------call interface stuffs----------------------

  const [incomingCall, setincomingCall] = useState(false)
  const [inCall, setinCall] = useState(false)

  const ringtone = useRef(null)

  const { data: session, isPending: seshpend } = useSession()

  useEffect(() => {
    const myClientId = session?.user.id

    const eventSource = new EventSource(
      `/api/v1/test/events?clientId=${myClientId}`,
    )

    // Listen for incoming messages targeting this client
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data)

      if (data.type == 'call') {
        if (data.order == 'final') {
          //Need this lul
          submitAnswer(data.offer)
        } else if (data.order == 'initial') {
          setotherusername(data.username)
          setinitialsdp(data.offer)
          setotherID(data.userid)
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
    setconnectionStatus('Calling')
    setIsListening(true)
    ringtone.current.pause()
    setincomingCall(false)
    setinCall(true)
    const sdp = await acceptCall()
    sendCallRequest(otherID, JSON.stringify(sdp), 'final')
  }

  function DeclineCall() {
    ringtone.current.pause()
    setincomingCall(false)
  }

  function HangUpCall() {
    setIsListening(false)
    setinCall(false)
    cleanup()
  }

  async function SendCall(id) {
    setconnectionStatus('Calling')
    setIsListening(true)
    setinCall(true)
    const myClientId = session?.user.id
    const sdp = await startCall()
    //My vclient id :oiZ6VbOZbNaN1zbtNqk0pubBRyvkq2hS
    //Bros client id : rztLnolAoFGAaevREVdZcUgsv7GXVlEq
    sendCallRequest(
      id,
      JSON.stringify(sdp),
      'initial',
      myClientId,
      session?.user.username,
    )
  }

  useEffect(() => {
    if (callrequest) {
      SendCall(callrequest.userId)
      setotherusername(callrequest.name)
    }
  }, [callrequest])

  //----------------Com to other client---------------------

  const ssemessage = useNewSse()

  async function sendCallRequest(
    id: string,
    sdpthing?: string,
    order?: string,
    userid?: string,
    username?: string,
  ) {
    const data = {
      targetClientId: id,
      message: {
        type: 'call',
        userid: userid,
        username: username,
        order: order,
        offer: sdpthing,
      },
    }

    await ssemessage.mutateAsync(data)
  }

  function letest() {
    if (pcRef.current) {
      setconnectionStatus(pcRef.current.connectionState)
    }
  }

  //User statuses, make send to server later

  const statuses = {
    online:
      'animate-gradient-bg bg-linear-160 from-green-500 via-gray-700 to-gray-700',
    idle: 'animate-gradient-bg bg-linear-160 from-yellow-500 via-gray-700 to-gray-700',
    donotdih:
      'animate-gradient-bg bg-linear-160 from-red-500 via-gray-700 to-gray-700',
    offline: 'bg-gray-700',
  }

  const [currentStatus, setcurrentStatus] = useState('online')
  const [popover, setpopover] = useState(false)

  //Fix it later
  const handleParentClick = (e) => {
    if (e.target !== e.currentTarget) return
    setpopover((v) => !v)
  }

  function statusHandler(e) {
    //console.log(e.target.value)
    setcurrentStatus(e.target.value)
  }

  const statusslop = useStatusChange()

  async function changeStatus() {
    await statusslop.mutateAsync({ status: currentStatus })
  }

  const states = ['', 'hidden']

  return (
    <div className={`fixed z-5000 bottom-0 ${states[inCall]}`}>
      <div className={`m-5 rounded-sm  ${statuses[currentStatus]} p-px `}>
        <div className="rounded-sm bg-black p-1 w-[280px]">
          <audio className="hidden" ref={ringtone}>
            <source src="/audio/Over_the_Horizon.ogg" type="audio/ogg" />
          </audio>
          <audio ref={remoteAudioRef} autoPlay />
          {/*<button onClick={() => changeStatus()}>CHANGEIT</button>*/}
          {incomingCall && (
            <div className="mb-3 flex justify-between border-b pb-2">
              <p>{otherusername} calling</p>
              <div className="flex gap-4">
                <button onClick={AcceptCall}>✓</button>
                <button onClick={DeclineCall}>X</button>
              </div>
            </div>
          )}

          {inCall && (
            <div className="mb-3 flex justify-between border-b pb-2">
              <div className="flex justify-between w-full pr-4">
                <p>{otherusername}</p>
                <p>{connectionStatus}</p>
              </div>
              <div className="flex gap-4">
                <button onClick={HangUpCall}>X</button>
              </div>
            </div>
          )}

          <div className="flex justify-between">
            {popover && (
              <div className=" absolute bottom-full border border-gray-700 bg-black rounded-sm p-2 w-40 h-20">
                <p>Popover</p>
                <select
                  onChange={statusHandler}
                  defaultValue={currentStatus}
                  className="select"
                >
                  <option className="text-black bg-white" value="online">
                    Online
                  </option>
                  <option className="text-black bg-white" value="idle">
                    idle
                  </option>
                  <option className="text-black bg-white" value="donotdih">
                    do not dihsturb
                  </option>
                  <option className="text-black bg-white" value="offline">
                    Offline
                  </option>
                </select>
              </div>
            )}
            <div
              onClick={handleParentClick}
              className="transition-all flex gap-3 w-full hover:bg-[#6363633b] cursor-pointer rounded-sm p-1"
            >
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
                <p className="select-none">{session?.user.username}</p>
                <p className="select-none text-gray-400 text-xs">doing thing</p>
              </div>
            </div>
            <div className="flex gap-2">
              {mute ? (
                <button
                  onClick={toggleMute}
                  className="px-2 rounded-sm cursor-pointer hover:bg-[#6363633b] transition-all"
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
                  className="px-2 rounded-sm cursor-pointer hover:bg-[#6363633b] transition-all"
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
          <TheBar isListening={isListening} />
        </div>
      </div>
    </div>
  )
}
