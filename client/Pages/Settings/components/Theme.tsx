import { useEffect, useState } from 'react'

export function Theme() {
  //refactor this mess bro

  const theme = localStorage.getItem('theme')

  let initialPosition = ''

  if (theme == 'light') {
    initialPosition = 'center'
  } else {
    initialPosition = 'left'
  }

  const [state, setState] = useState(initialPosition) // options: 'left', 'center', 'right'

  function themehandler() {
    if (state == 'left') {
      localStorage.setItem('theme', 'dark')
    } else if (state == 'center') {
      localStorage.setItem('theme', 'light')
    }

    const theme2 = localStorage.getItem('theme')

    if (theme2 == 'light') {
      document.documentElement.classList.remove('dark')
    } else {
      document.documentElement.classList.add('dark')
    }
  }

  useEffect(() => {
    themehandler()
  }, [state])

  const positions = {
    left: 'translate-x-0',
    center: 'translate-x-[95%]',
    right: 'translate-x-[190%]',
  }

  return (
    <div>
      <p className="mb-4 text-lg">Appearance</p>
      <div className="relative flex w-48 h-10 p-1 rounded-full items-center border-2">
        {/* Moving Indicator */}
        <div
          className={`absolute w-1/3 h-8 rounded-full shadow transition-transform duration-300 ease-in-out ${positions[state]} bg-[rgba(255,_255,_255,_0.09)] [box-shadow:0_4px_30px_rgba(0,_0,_0,_0.1)] backdrop-filter backdrop-blur-[2.5px] border-[1px] border-[solid] border-[rgba(255,255,255,0.47)]`}
        />
        {/* Clickable Targets */}
        <button
          onClick={() => setState('left')}
          className="relative z-10 w-1/3 text-xs font-semibold cursor-pointer"
        >
          Dark
        </button>
        <button
          onClick={() => setState('center')}
          className="relative z-10 w-1/3 text-xs font-semibold cursor-pointer"
        >
          Light
        </button>
        <button
          onClick={() => setState('right')}
          className="relative z-10 w-1/3 text-xs font-semibold cursor-pointer"
        >
          Custom
        </button>
      </div>
    </div>
  )
}
