import { useState } from 'react'

export function Switch({
  checked,
  onChange,
  label,
  accent = false,
  disabled = false,
}) {
  return (
    <label
      className={`relative inline-flex items-center gap-3 font-[Poppins] text-base transition-colors
        ${checked ? 'text-white' : 'text-neutral-500'}
        ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
    >
      <input
        type="checkbox"
        role="switch"
        className="peer sr-only"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />

      {/* track */}
      <span
        className="flex h-[30px] w-14 flex-none items-center rounded-full border-2 border-white bg-black p-1
          peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-[3px] peer-focus-visible:outline-white"
      >
        {/* knob */}
        <span
          className={`h-[18px] w-[18px] rounded-full transition-all duration-200 ease-out motion-reduce:transition-none
            ${
              checked
                ? `translate-x-[26px] ${accent ? 'bg-[#ff3b3b]' : 'bg-white'}`
                : 'translate-x-0 bg-neutral-700'
            }`}
        />
      </span>

      {label && <span>{label}</span>}
    </label>
  )
}

// Demo / example usage
export default function Demo() {
  const [market, setMarket] = useState(false)

  return (
    <div className="min-h-screen bg-black p-12 text-white">
      <h2 className="mb-5 text-2xl font-normal">Filter</h2>
      <Switch checked={market} onChange={setMarket} label="Theme market" />
    </div>
  )
}
