import type { CSSProperties } from 'react'

type Props = { color: string; enabled: boolean }

export function ColorFilterOverlay({ color, enabled }: Props) {
  return (
    <div
      style={{ '--dynamic-color': color } as CSSProperties}
      data-state={enabled}
      className="fixed top-0 left-0 w-full h-full z-[9999] pointer-events-none
                 data-[state=true]:bg-[var(--dynamic-color)] opacity-10
                 transition-colors duration-700 ease-in-out"
    />
  )
}
