import { useRef, useState } from 'react'
import { CallerCard } from './callercard'

export function Call() {
  //THIS GETS DESKTOP CAPTURE LEL
  const theWindow = useRef(null)

  const [theheight, settheheight] = useState(false)

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

  // does a thing????
  const videoRefs = useRef(new Map())

  function getMap() {
    return videoRefs.current
  }

  function playVideo(id, stream) {
    const node = getMap().get(id)
    console.log(node)
    if (node) node.srcObject = stream
  }

  //gets desktop shid
  async function THESTREAM() {
    leAddVideo()
    try {
      // Request permission and get the video stream
      const captureStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false, // Set to true if you need to capture system audio
      })

      // Bind the stream to the HTML video element
      playVideo(3, captureStream)
    } catch (err) {
      console.error('Error capturing screen: ', err)
    }
  }

  function inflationmax() {
    if (theheight) {
      settheheight(false)
    } else {
      settheheight(true)
    }
  }

  const leAddVideo = () => {
    const temp = [...people]
    const video = { id: 3, isvideo: true }
    console.log(people)
    console.log(temp)
    temp.push(video)
    setpeople(temp)
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
      className={`absolute bg-[#11001cf4] w-[stretch] flex flex-col gap-4 p-6 z-10 ${
        theheight && 'h-full'
      }`}
    >
      <div className="justify-center gap-6 flex">
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
      <div className="flex justify-center gap-4">
        <button
          onClick={THESTREAM}
          className="bg-amber-950 px-2 rounded-sm cursor-pointer"
        >
          STREAM SCREEN?
        </button>
        <button
          onClick={() => talkingtest(2)}
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
