import { afterEach, describe, expect, it, vi } from 'vitest'

const originalMatchMedia = window.matchMedia

/** Loads the router options fresh, with the visitor's reduced-motion setting simulated. */
async function load(prefersReducedMotion: boolean) {
  window.matchMedia = ((query: string) => ({
    matches: prefersReducedMotion && query === '(prefers-reduced-motion: reduce)',
    media: query,
  })) as unknown as typeof window.matchMedia
  return (await import('../app/router.options')).default
}

afterEach(() => {
  window.matchMedia = originalMatchMedia
  vi.resetModules()
})

describe('router options', () => {
  it('scrolls smoothly to a section on the page, e.g. Kontakt → #contact', async () => {
    expect((await load(false)).scrollBehaviorType).toBe('smooth')
  })

  it('jumps instantly when the visitor prefers reduced motion', async () => {
    expect((await load(true)).scrollBehaviorType).toBe('auto')
  })
})
