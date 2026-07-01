import { useState, useEffect, useRef, useCallback } from 'react'

// ─── WebRTC config ────────────────────────────────────────────────────────────
const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const css = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
 
  body { font-family: system-ui, sans-serif; background: #0f0f0f; color: #fff; }
 
  .app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: #0f0f0f;
  }
 
  /* ── Header ── */
  .header {
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #222;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  .header-dot {
    width: 10px; height: 10px;
    border-radius: 50%;
    background: #22c55e;
    box-shadow: 0 0 8px #22c55e88;
  }
  .header-dot.idle { background: #555; box-shadow: none; }
  .header h1 { font-size: 1.1rem; font-weight: 500; letter-spacing: -0.01em; }
  .header-status { margin-left: auto; font-size: 0.8rem; color: #666; }
 
  /* ── Video grid ── */
  .video-grid {
    flex: 1;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1px;
    background: #111;
    min-height: 0;
  }
  .video-grid.solo { grid-template-columns: 1fr; }
 
  .video-pane {
    position: relative;
    background: #141414;
    aspect-ratio: 16/9;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .video-pane video {
    width: 100%; height: 100%;
    object-fit: cover;
    display: block;
  }
  .video-pane .label {
    position: absolute;
    bottom: 0.75rem; left: 0.75rem;
    background: rgba(0,0,0,0.65);
    backdrop-filter: blur(4px);
    border-radius: 6px;
    padding: 3px 10px;
    font-size: 0.75rem;
    color: #ddd;
    pointer-events: none;
  }
  .video-pane .no-video {
    width: 64px; height: 64px;
    border-radius: 50%;
    background: #252525;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.5rem;
    color: #555;
  }
 
  /* ── Signaling panel ── */
  .signal-panel {
    border-top: 1px solid #1e1e1e;
    padding: 1.25rem 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .signal-row { display: flex; gap: 0.75rem; align-items: flex-start; }
  .signal-row textarea {
    flex: 1;
    background: #1a1a1a;
    border: 1px solid #2a2a2a;
    border-radius: 8px;
    color: #ccc;
    font-family: ui-monospace, monospace;
    font-size: 0.7rem;
    padding: 0.6rem 0.75rem;
    resize: vertical;
    min-height: 72px;
    line-height: 1.4;
  }
  .signal-row textarea::placeholder { color: #444; }
  .signal-row textarea:focus {
    outline: none;
    border-color: #3b82f6;
  }
 
  /* ── Controls bar ── */
  .controls {
    border-top: 1px solid #1e1e1e;
    padding: 1rem 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    flex-wrap: wrap;
  }
 
  .btn {
    display: inline-flex; align-items: center; gap: 0.4rem;
    padding: 0.55rem 1.1rem;
    border-radius: 8px;
    border: 1px solid #2a2a2a;
    background: #1a1a1a;
    color: #ccc;
    font-size: 0.82rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s, transform 0.1s;
    user-select: none;
  }
  .btn:hover { background: #242424; border-color: #333; }
  .btn:active { transform: scale(0.97); }
  .btn:disabled { opacity: 0.35; cursor: not-allowed; transform: none; }
 
  .btn.primary {
    background: #1d4ed8; border-color: #2563eb; color: #fff;
  }
  .btn.primary:hover { background: #2563eb; }
 
  .btn.danger {
    background: #7f1d1d; border-color: #991b1b; color: #fca5a5;
  }
  .btn.danger:hover { background: #991b1b; }
 
  .btn.muted {
    background: #2d2d2d; border-color: #3d3d3d; color: #888;
  }
 
  .icon { font-size: 1rem; line-height: 1; }
 
  .step-label {
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #555;
    margin-bottom: 0.25rem;
  }
 
  .hint {
    font-size: 0.75rem;
    color: #444;
    text-align: center;
    padding-bottom: 0.25rem;
  }
`

// ─── Icons (inline SVG) ───────────────────────────────────────────────────────
const Icon = ({ name, size = 16 }) => {
  const icons = {
    camera: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M23 7l-7 5 7 5V7z" />
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
      </svg>
    ),
    'camera-off': (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M16 16v1a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2h2" />
        <path d="M7 4h5l2 3h3l5 3v5m0 4L1 1" />
      </svg>
    ),
    mic: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
        <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" />
      </svg>
    ),
    'mic-off': (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="1" y1="1" x2="23" y2="23" />
        <path d="M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6" />
        <path d="M17 16.95A7 7 0 015 12v-2m14 0v2a7 7 0 01-.11 1.23M12 19v4M8 23h8" />
      </svg>
    ),
    phone: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8 19.79 19.79 0 01.1 2.18 2 2 0 012.11 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
      </svg>
    ),
    'phone-off': (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M10.68 13.31a16 16 0 003.41 2.6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.42 19.42 0 01-3.33-2.67M1 1l22 22M6.09 7.91L4.36 6.18A2 2 0 014.81 4.07c.96-.127 1.903-.361 2.81-.7A2 2 0 019.73 1H12.7a2 2 0 012 1.72" />
      </svg>
    ),
    copy: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="9" y="9" width="13" height="13" rx="2" />
        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
      </svg>
    ),
    check: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
    user: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  }
  return icons[name] || null
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function WebRTCCall() {
  const [phase, setPhase] = useState('idle') // idle | ready | calling | connected
  const [offerSDP, setOfferSDP] = useState('')
  const [answerSDP, setAnswerSDP] = useState('')
  const [remoteInput, setRemoteInput] = useState('')
  const [micOn, setMicOn] = useState(true)
  const [camOn, setCamOn] = useState(true)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  const pcRef = useRef(null)
  const localStreamRef = useRef(null)
  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)

  // ── Cleanup ────────────────────────────────────────────────────────────────
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

  // ── Get local media ────────────────────────────────────────────────────────
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

  // ── Build peer connection ──────────────────────────────────────────────────
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

  // ── CALLER: create offer ───────────────────────────────────────────────────
  const startCall = async () => {
    setError('')
    try {
      const stream = await getMedia()
      const pc = buildPC(stream)
      setPhase('calling')

      // Gather all ICE candidates before sharing (trickle-less for simplicity)
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      await new Promise((resolve) => {
        if (pc.iceGatheringState === 'complete') return resolve()
        pc.onicegatheringstatechange = () => {
          if (pc.iceGatheringState === 'complete') resolve()
        }
      })

      setOfferSDP(JSON.stringify(pc.localDescription))
    } catch (e) {
      setError(e.message)
      setPhase('idle')
    }
  }

  // ── CALLER: receive answer ─────────────────────────────────────────────────
  const submitAnswer = async () => {
    setError('')
    try {
      const answer = JSON.parse(remoteInput.trim())
      await pcRef.current.setRemoteDescription(
        new RTCSessionDescription(answer),
      )
    } catch (e) {
      setError('Invalid answer SDP: ' + e.message)
    }
  }

  // ── CALLEE: receive offer, create answer ───────────────────────────────────
  const acceptCall = async () => {
    setError('')
    try {
      const offer = JSON.parse(remoteInput.trim())
      const stream = await getMedia()
      const pc = buildPC(stream)
      setPhase('calling')

      await pc.setRemoteDescription(new RTCSessionDescription(offer))
      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)

      await new Promise((resolve) => {
        if (pc.iceGatheringState === 'complete') return resolve()
        pc.onicegatheringstatechange = () => {
          if (pc.iceGatheringState === 'complete') resolve()
        }
      })

      setAnswerSDP(JSON.stringify(pc.localDescription))
      setRemoteInput('')
    } catch (e) {
      setError('Failed to accept: ' + e.message)
      setPhase('idle')
    }
  }

  // ── Toggle mic / cam ───────────────────────────────────────────────────────
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

  // ── Copy helper ───────────────────────────────────────────────────────────
  const copy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  const isActive = phase === 'calling' || phase === 'connected'
  const statusMap = {
    idle: 'Ready to connect',
    ready: 'Media acquired',
    calling: 'Exchanging signals…',
    connected: 'Connected',
  }

  return (
    <>
      <style>{css}</style>
      <div className="app">
        {/* Header */}
        <div className="header">
          <div className={`header-dot ${phase === 'idle' ? 'idle' : ''}`} />
          <h1>WebRTC Call</h1>
          <span className="header-status">{statusMap[phase]}</span>
        </div>

        {/* Video grid */}
        <div className={`video-grid ${phase !== 'connected' ? 'solo' : ''}`}>
          <div className="video-pane">
            {isActive ? (
              <video ref={localVideoRef} autoPlay muted playsInline />
            ) : (
              <div className="no-video">
                <Icon name="user" size={28} />
              </div>
            )}
            <span className="label">You</span>
          </div>

          {phase === 'connected' && (
            <div className="video-pane">
              <video ref={remoteVideoRef} autoPlay playsInline />
              <span className="label">Remote</span>
            </div>
          )}
        </div>

        {/* Signaling panel — shown when not yet connected */}
        {phase !== 'connected' && (
          <div className="signal-panel">
            {error && (
              <div
                style={{
                  color: '#fca5a5',
                  fontSize: '0.78rem',
                  background: '#1c0a0a',
                  border: '1px solid #7f1d1d',
                  borderRadius: 8,
                  padding: '0.5rem 0.75rem',
                }}
              >
                {error}
              </div>
            )}

            {/* Step 1: Caller creates offer */}
            {phase === 'idle' && (
              <div className="hint">
                Start a call to generate an offer, or paste an offer below to
                join.
              </div>
            )}

            {offerSDP && (
              <div>
                <div className="step-label">
                  1 · Share this offer with the other person
                </div>
                <div className="signal-row">
                  <textarea readOnly value={offerSDP} rows={3} />
                  <button
                    className="btn muted"
                    onClick={() => copy(offerSDP)}
                    style={{ flexShrink: 0, alignSelf: 'flex-start' }}
                  >
                    <Icon name={copied ? 'check' : 'copy'} size={14} />
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            )}

            {/* Answer from callee */}
            {answerSDP && (
              <div>
                <div className="step-label">
                  2 · Share this answer back with the caller
                </div>
                <div className="signal-row">
                  <textarea readOnly value={answerSDP} rows={3} />
                  <button
                    className="btn muted"
                    onClick={() => copy(answerSDP)}
                    style={{ flexShrink: 0, alignSelf: 'flex-start' }}
                  >
                    <Icon name={copied ? 'check' : 'copy'} size={14} />
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            )}

            {/* Remote SDP input */}
            <div>
              <div className="step-label">
                {offerSDP
                  ? '3 · Paste the answer SDP from the other person'
                  : 'Join · Paste offer SDP here'}
              </div>
              <div className="signal-row">
                <textarea
                  value={remoteInput}
                  onChange={(e) => setRemoteInput(e.target.value)}
                  placeholder={
                    offerSDP
                      ? 'Paste answer SDP here…'
                      : 'Paste offer SDP here to join a call…'
                  }
                  rows={3}
                />
                <button
                  className="btn primary"
                  disabled={!remoteInput.trim()}
                  onClick={offerSDP ? submitAnswer : acceptCall}
                  style={{ flexShrink: 0, alignSelf: 'flex-start' }}
                >
                  {offerSDP ? 'Connect' : 'Answer'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="controls">
          {phase === 'idle' && (
            <button className="btn primary" onClick={startCall}>
              <Icon name="phone" size={15} /> Start call
            </button>
          )}

          {isActive && (
            <>
              <button
                className={`btn ${micOn ? '' : 'muted'}`}
                onClick={toggleMic}
              >
                <Icon name={micOn ? 'mic' : 'mic-off'} size={15} />
                {micOn ? 'Mute' : 'Unmute'}
              </button>
              <button
                className={`btn ${camOn ? '' : 'muted'}`}
                onClick={toggleCam}
              >
                <Icon name={camOn ? 'camera' : 'camera-off'} size={15} />
                {camOn ? 'Stop video' : 'Start video'}
              </button>
              <button className="btn danger" onClick={cleanup}>
                <Icon name="phone-off" size={15} /> End call
              </button>
            </>
          )}
        </div>
      </div>
    </>
  )
}
