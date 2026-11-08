import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { Switch } from '../../Util/Switch'
import { ColorPicker } from '../../Util/Color'
import { useColorFilter } from '../../Util/colors/ColorFilterContext'

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

  const { color, setColor, enabled, setEnabled } = useColorFilter()

  return (
    <div className="flex flex-col">
      <p className="mb-4 text-2xl pb-2">Appearance</p>
      <div className="relative flex w-48 h-10 p-1 rounded-full items-center border-2 mb-4">
        <div
          className={`absolute w-1/3 h-8 rounded-full shadow transition-transform duration-300 ease-in-out ${positions[state]} bg-[rgba(255,_255,_255,_0.09)] [box-shadow:0_4px_30px_rgba(0,_0,_0,_0.1)] backdrop-filter backdrop-blur-[2.5px] border-[1px] border-[solid] border-[rgba(255,255,255,0.47)]`}
        />
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
      <div className="pb-4">
        <Switch checked={enabled} onChange={setEnabled} label="Filter" />
      </div>
      <div
        data-state={enabled}
        className={`z-1001 border-b border-zinc-800 pb-4 overflow-hidden transition-all duration-300 ease-out max-h-0 opacity-0 data-[state=true]:max-h-96 data-[state=true]:opacity-100`}
      >
        <ColorPicker value={color} onChange={setColor} label={''} />
      </div>

      {/*
      <Link
        className="transition-color text-zinc-500 hover:text-zinc-200 hover:underline focus-visible:text-zinc-300 focus-visible:underline focus-visible:outline-none"
        to={'/market'}
      >
        Theme market
      </Link>
*/}
    </div>
  )
}
