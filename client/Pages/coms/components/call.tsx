import { useRef, useState } from 'react'
import { CallerCard } from './callercard'

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
      istalking: true,
      isvideo: false,
    },
    {
      img: 'http://localhost:5173/images/grace.jpg',
      id: 2,
      istalking: false,
      isvideo: false,
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
        audio: false,
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

  return (
    <div
      ref={theWindow}
      className={`absolute bg-[#11001cf4] w-[stretch] flex flex-col gap-4 p-6 z-10 items-center ${
        theheight && 'h-full'
      }`}
    >
      <div
        className="grid gap-2 p-2 h-full
            grid-cols-[repeat(auto-fit,minmax(300px,1fr))]
            auto-rows-fr w-full"
      >
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
            End Stream
          </button>
        ) : (
          <button
            onClick={shareScreenLocal}
            className="bg-amber-950 px-2 rounded-sm cursor-pointer"
          >
            Stream Screen
          </button>
        )}

        <button
          onClick={ENDDACALL}
          className="bg-amber-950 px-2 rounded-sm cursor-pointer"
        >
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
