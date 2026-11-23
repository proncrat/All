import { useEffect, useState } from 'react'
import { Switch } from '../../Util/Switch'
import { ColorPicker } from '../../Util/Color'
import { useColorFilter } from '../../Util/colors/ColorFilterContext'

type Mode = 'dark' | 'light' | 'custom'

const MODES: Mode[] = ['dark', 'light', 'custom']
const MODE_INDEX: Record<Mode, number> = { dark: 0, light: 1, custom: 2 }

function readStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw === null ? fallback : (JSON.parse(raw) as T)
  } catch {
    return fallback
  }
}

export function Theme() {
  const {
    color,
    setColor,
    enabled: filterEnabled,
    setEnabled: setFilterEnabled,
  } = useColorFilter()

  // ---- theme mode ----
  const [mode, setMode] = useState<Mode>(() =>
    readStored<Mode>('theme', 'dark'),
  )

  useEffect(() => {
    localStorage.setItem('theme', JSON.stringify(mode))
    if (mode === 'light') document.documentElement.classList.remove('dark')
    else if (mode === 'dark') document.documentElement.classList.add('dark')
    // 'custom' leaves the class alone, same as your original behavior
  }, [mode])

  // ---- corners ----
  const [cornersEnabled, setCornersEnabled] = useState(() =>
    readStored('corners-enabled', false),
  )
  const [radius, setRadius] = useState(() => readStored('corners-radius', 8))

  useEffect(() => {
    localStorage.setItem('corners-enabled', JSON.stringify(cornersEnabled))
    localStorage.setItem('corners-radius', JSON.stringify(radius))

    const root = document.documentElement.style
    if (cornersEnabled) {
      // Custom: slider controls the radius; 0 also squares off pill shapes
      root.setProperty('--app-radius', `${radius}px`)
      root.setProperty('--app-radius-full', radius === 0 ? '0px' : '9999px')
    } else {
      // Off: drop overrides so the default radii from main.css apply
      root.removeProperty('--app-radius')
      root.removeProperty('--app-radius-full')
    }
  }, [cornersEnabled, radius])

  return (
    <div className="flex flex-col">
      <p className="mb-4 text-2xl pb-2">Appearance</p>

      {/* Mode selector */}
      <div className="relative flex w-48 h-10 p-1 rounded-full items-center border-2 mb-4">
        <div
          className="absolute w-1/3 h-8 rounded-full shadow transition-transform duration-300 ease-in-out bg-[rgba(255,255,255,0.09)] backdrop-blur-[2.5px] border border-[rgba(255,255,255,0.47)]"
          style={{ transform: `translateX(${MODE_INDEX[mode] * 95}%)` }}
        />
        {MODES.map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className="relative z-10 w-1/3 text-xs font-semibold cursor-pointer capitalize"
          >
            {m}
          </button>
        ))}
      </div>

      {/* Filter */}
      <div className="pb-4">
        <Switch
          checked={filterEnabled}
          onChange={setFilterEnabled}
          label="Filter"
        />
      </div>
      <div
        data-state={filterEnabled}
        className="z-1001 border-b border-zinc-800 pb-4 overflow-hidden transition-all duration-300 ease-out max-h-0 opacity-0 data-[state=true]:max-h-96 data-[state=true]:opacity-100"
      >
        <ColorPicker value={color} onChange={setColor} label="" />
      </div>

      {/* Corners */}
      <div className="py-4">
        <Switch
          checked={cornersEnabled}
          onChange={setCornersEnabled}
          label="Corners"
        />
      </div>
      <div
        data-state={cornersEnabled}
        className="overflow-hidden transition-all duration-300 ease-out max-h-0 opacity-0 data-[state=true]:max-h-96 data-[state=true]:opacity-100"
      >
        <div className="flex items-center gap-3 pb-4">
          <input
            type="range"
            min={0}
            max={32}
            step={1}
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="w-40 accent-zinc-400"
            aria-label="Corner radius"
          />
          <span className="text-xs tabular-nums w-10">{radius}px</span>
        </div>

        {/* Preview: uses real Tailwind radius classes, so it reflects the actual theme */}
        <div className="flex items-center gap-3 p-4 border border-zinc-700 w-fit rounded-[calc(var(--app-radius)*1.5)]">
          <div className="size-14 bg-zinc-600 rounded-[var(--app-radius)]" />
          <div className="flex flex-col gap-2">
            <button className="px-3 py-1 text-xs bg-zinc-700 rounded-[calc(var(--app-radius)*0.75)]">
              Button
            </button>
            <input
              placeholder="Input"
              className="px-2 py-1 text-xs bg-transparent border border-zinc-600 w-24 rounded-[calc(var(--app-radius)*0.5)]"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
