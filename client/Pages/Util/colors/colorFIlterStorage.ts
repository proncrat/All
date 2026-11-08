const COLOR_KEY = 'colorFilter:color'
const ENABLED_KEY = 'colorFilter:enabled'

export const DEFAULT_COLOR = '#ff0000'

export function saveColor(color: string) {
  try {
    localStorage.setItem(COLOR_KEY, color)
  } catch (e) {
    console.error('Could not save color', e)
  }
}

export function loadColor(): string {
  try {
    return localStorage.getItem(COLOR_KEY) ?? DEFAULT_COLOR
  } catch {
    return DEFAULT_COLOR
  }
}

export function saveEnabled(enabled: boolean) {
  try {
    localStorage.setItem(ENABLED_KEY, JSON.stringify(enabled))
  } catch (e) {
    console.error('Could not save filter state', e)
  }
}

export function loadEnabled(): boolean {
  try {
    return JSON.parse(localStorage.getItem(ENABLED_KEY) ?? 'false')
  } catch {
    return false
  }
}
