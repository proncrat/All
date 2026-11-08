'use client' // remove if you're not using Next.js app router

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import {
  DEFAULT_COLOR,
  loadColor,
  loadEnabled,
  saveColor,
  saveEnabled,
} from './colorFIlterStorage'

type ColorFilterContextValue = {
  color: string
  setColor: (color: string) => void
  enabled: boolean
  setEnabled: (enabled: boolean) => void
}

const ColorFilterContext = createContext<ColorFilterContextValue | null>(null)

export function ColorFilterProvider({ children }: { children: ReactNode }) {
  const [color, setColorState] = useState(DEFAULT_COLOR)
  const [enabled, setEnabledState] = useState(false)

  // Load stored values once on mount
  useEffect(() => {
    setColorState(loadColor())
    setEnabledState(loadEnabled())
  }, [])

  // Update state and storage together, so there's no "loaded" flag needed
  const setColor = (value: string) => {
    setColorState(value)
    saveColor(value)
  }

  const setEnabled = (value: boolean) => {
    setEnabledState(value)
    saveEnabled(value)
  }

  return (
    <ColorFilterContext.Provider
      value={{ color, setColor, enabled, setEnabled }}
    >
      {children}
      {/* Overlay lives inside the provider, so it always has the live values */}
      <div
        style={{ '--dynamic-color': color } as CSSProperties}
        data-state={enabled}
        className="fixed top-0 left-0 w-full h-full z-1000 pointer-events-none
                   data-[state=true]:bg-[var(--dynamic-color)]
                   transition-colors duration-700 ease-in-out"
      />
    </ColorFilterContext.Provider>
  )
}

export function useColorFilter() {
  const ctx = useContext(ColorFilterContext)
  if (!ctx)
    throw new Error('useColorFilter must be used inside <ColorFilterProvider>')
  return ctx
}
