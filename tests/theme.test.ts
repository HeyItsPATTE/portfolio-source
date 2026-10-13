import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { THEME_STORAGE_KEY } from '../app/utils/preferences'
import { isTheme, nextTheme, resolveInitialTheme, themeInitScript } from '../app/utils/theme'

const originalMatchMedia = window.matchMedia

function prefersLight(light: boolean) {
  window.matchMedia = ((query: string) => ({
    matches: light && query === '(prefers-color-scheme: light)',
    media: query,
  })) as unknown as typeof window.matchMedia
}

function runInitScript(): string | null {
  document.documentElement.removeAttribute('data-theme')
  new Function(themeInitScript)()
  return document.documentElement.getAttribute('data-theme')
}

describe('resolveInitialTheme', () => {
  it('prefers a stored valid theme over the system setting', () => {
    expect(resolveInitialTheme('day', false)).toBe('day')
    expect(resolveInitialTheme('night', true)).toBe('night')
  })

  it('follows the system setting when nothing valid is stored', () => {
    expect(resolveInitialTheme(null, true)).toBe('day')
    expect(resolveInitialTheme(undefined, false)).toBe('night')
    expect(resolveInitialTheme('blue', true)).toBe('day')
  })
})

describe('isTheme and nextTheme', () => {
  it('accept only night and day, and flip between them', () => {
    expect(isTheme('night')).toBe(true)
    expect(isTheme('dark')).toBe(false)
    expect(nextTheme('night')).toBe('day')
    expect(nextTheme('day')).toBe('night')
  })
})

describe('themeInitScript', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => {
    vi.restoreAllMocks()
    window.matchMedia = originalMatchMedia
  })

  it.each([
    [null, false, 'night'],
    [null, true, 'day'],
    ['day', false, 'day'],
    ['night', true, 'night'],
    ['blue', true, 'day'],
  ] as const)('stored=%s prefersLight=%s gives %s, same as resolveInitialTheme', (stored, light, expected) => {
    if (stored) localStorage.setItem(THEME_STORAGE_KEY, stored)
    prefersLight(light)
    expect(runInitScript()).toBe(expected)
    expect(resolveInitialTheme(stored, light)).toBe(expected)
  })

  it('still follows the system setting when storage throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied')
    })
    prefersLight(true)
    expect(runInitScript()).toBe('day')
  })

  it('falls back to night in a browser without matchMedia', () => {
    ;(window as { matchMedia?: unknown }).matchMedia = undefined
    expect(runInitScript()).toBe('night')
  })
})
