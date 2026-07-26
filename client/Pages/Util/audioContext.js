let sharedContext = null

export function getSharedAudioContext() {
  if (!sharedContext) {
    sharedContext = new (window.AudioContext || window.webkitAudioContext)()
  }
  if (sharedContext.state === 'suspended') {
    sharedContext.resume()
  }
  return sharedContext
}
