import { useEffect, useState } from 'react'

export function Theme() {
  function toggleDarkMode() {
    document.documentElement.classList.toggle('dark')

    // Optional: Save preference to localStorage
    const isDark = document.documentElement.classList.contains('dark')
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }

  const [state, setState] = useState('left') // options: 'left', 'center', 'right'

  useEffect(() => {
    toggleDarkMode()
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
