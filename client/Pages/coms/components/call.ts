import Peer from 'peerjs'
//https://peerjs.com/client/getting-started

//Change over to this https://sipjs.com/ for multi person call yes

//https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia

export function init_calls(id: string) {
  return new Peer(id)
}

const testConstraints = {
  audio: true,
  video: true,
}

export async function startCall(
  peer,
  recieverid,
  constraints = testConstraints,
) {
  let mediastream = null

  try {
    mediastream = await navigator.mediaDevices.getUserMedia(constraints)
    const call = peer.call(recieverid, mediastream)
    console.log('call started')
  } catch (err) {
    console.log('startCall broke?')
  }
}

export async function answerCall(peer, constraints = testConstraints) {
  let mediastream = null

  try {
    mediastream = await navigator.mediaDevices.getUserMedia(constraints)
    peer.on('call', function (call) {
      console.log('answereeds')
      call.answer(mediastream)
      call.on('stream', function (stream) {
        console.log(stream)
        // `stream` is the MediaStream of the remote peer.
        // Here you'd add it to an HTML video/canvas element.
      })
    })
  } catch (err) {
    console.log('answerCall broke?')
  }
}

export function answercall2(peer) {
  peer.on('call', function (call) {
    console.log('answereeds')
  })
}
