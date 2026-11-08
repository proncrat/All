import { useEffect, useState } from 'react'

const DEFAULT_PRESETS = [
  '#ff3b3b', // theme red
  '#ff8a3b',
  '#ffd23b',
  '#3bff8a',
  '#3bc8ff',
  '#6b5cff',
  '#c25cff',
  '#ffffff',
]

// accepts #rrggbb or #rrggbbaa
const HEX = /^#[0-9a-f]{6}([0-9a-f]{2})?$/i

const CHECKER =
  'repeating-conic-gradient(#4a4a4a 0% 25%, #222 0% 50%) 0 0 / 10px 10px'

const split = (value) => ({
  base: value.slice(0, 7).toLowerCase(),
  alpha: value.length === 9 ? parseInt(value.slice(7, 9), 16) : 255,
})

// full opacity stays a plain #rrggbb, anything less becomes #rrggbbaa
const join = (base, alpha) =>
  alpha >= 255 ? base : base + alpha.toString(16).padStart(2, '0')

const toRgb = (base) => {
  const n = parseInt(base.slice(1), 16)
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`
}

export function ColorPicker({
  value,
  onChange,
  presets = DEFAULT_PRESETS,
  label,
  showAlpha = true,
}) {
  const [draft, setDraft] = useState(value)
  const { base, alpha } = split(value)
  const isPreset = presets.some((c) => c.toLowerCase() === base)
  const percent = Math.round((alpha / 255) * 100)

  // keep the text field in sync when the value changes from outside
  useEffect(() => setDraft(value), [value])

  const setBase = (next) => onChange(join(next.toLowerCase(), alpha))

  const commit = (text) => {
    const next = text.startsWith('#') ? text : `#${text}`
    setDraft(next)
    if (HEX.test(next)) onChange(next.toLowerCase())
  }

  return (
    <div className="inline-flex flex-col gap-4 font-[Poppins] text-white">
      {label && <span className="text-base text-neutral-500">{label}</span>}

      {/* presets + custom */}
      <div
        role="radiogroup"
        aria-label={label || 'Color'}
        className="flex items-center gap-3"
      >
        {presets.map((c) => {
          const selected = c.toLowerCase() === base
          return (
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={c}
              onClick={() => setBase(c)}
              className={`h-8 w-8 flex-none rounded-full border-2 p-[3px] transition-colors
                focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-white
                ${selected ? 'border-white' : 'border-transparent hover:border-neutral-600'}`}
            >
              <span
                className="block h-full w-full rounded-full"
                style={{ background: c }}
              />
            </button>
          )
        })}

        {/* custom color: rainbow ring wrapping the native picker */}
        <label
          title="Custom color"
          className={`relative h-8 w-8 flex-none cursor-pointer rounded-full border-2 p-[3px] transition-colors
            focus-within:outline focus-within:outline-2 focus-within:outline-offset-[3px] focus-within:outline-white
            ${!isPreset ? 'border-white' : 'border-transparent hover:border-neutral-600'}`}
        >
          <span
            className="block h-full w-full rounded-full"
            style={{
              background: isPreset
                ? 'conic-gradient(#ff3b3b, #ffd23b, #3bff8a, #3bc8ff, #c25cff, #ff3b3b)'
                : base,
            }}
          />
          <input
            type="color"
            value={base}
            onChange={(e) => setBase(e.target.value)}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            aria-label="Custom color"
          />
        </label>
      </div>

      {/* opacity slider */}
      {showAlpha && (
        <div className="flex items-center gap-3">
          <div
            className="flex h-[30px] w-64 items-center rounded-full border-2 border-white px-1"
            style={{
              background: `linear-gradient(to right, rgba(${toRgb(base)}, 0), ${base}), ${CHECKER}`,
            }}
          >
            <input
              type="range"
              min={0}
              max={255}
              step={1}
              value={alpha}
              onChange={(e) => onChange(join(base, Number(e.target.value)))}
              aria-label="Opacity"
              aria-valuetext={`${percent}%`}
              className="h-full w-full cursor-pointer appearance-none bg-transparent outline-none
                focus-visible:[&::-webkit-slider-thumb]:outline focus-visible:[&::-webkit-slider-thumb]:outline-2
                focus-visible:[&::-webkit-slider-thumb]:outline-offset-2 focus-visible:[&::-webkit-slider-thumb]:outline-white
                [&::-webkit-slider-thumb]:h-[18px] [&::-webkit-slider-thumb]:w-[18px] [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-black
                [&::-webkit-slider-thumb]:bg-white
                [&::-moz-range-thumb]:h-[18px] [&::-moz-range-thumb]:w-[18px] [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-solid [&::-moz-range-thumb]:border-black
                [&::-moz-range-thumb]:bg-white"
            />
          </div>
          <span className="w-12 text-base text-neutral-500 tabular-nums">
            {percent}%
          </span>
        </div>
      )}

      {/* preview + hex field */}
      <div className="flex items-center gap-3">
        <span
          className="h-[30px] w-14 flex-none rounded-full border-2 border-white"
          style={{
            background: `linear-gradient(${value}, ${value}), ${CHECKER}`,
          }}
        />
        <input
          type="text"
          value={draft}
          onChange={(e) => commit(e.target.value)}
          onBlur={() => setDraft(value)}
          maxLength={9}
          spellCheck={false}
          aria-label="Hex color"
          aria-invalid={!HEX.test(draft)}
          className={`w-36 rounded-full border-2 bg-black px-4 py-1 text-base uppercase text-white outline-none
            transition-colors focus-visible:border-white
            ${HEX.test(draft) ? 'border-white' : 'border-[#ff3b3b]'}`}
        />
      </div>
    </div>
  )
}

// Demo / example usage
export default function Demo() {
  const [color, setColor] = useState('#ff3b3b')

  return (
    <div className="min-h-screen bg-black p-12">
      <h2 className="mb-5 text-2xl font-normal text-white">Customize</h2>
      <ColorPicker label="Accent color" value={color} onChange={setColor} />
    </div>
  )
}
