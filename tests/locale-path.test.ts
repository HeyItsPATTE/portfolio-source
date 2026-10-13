import { describe, expect, it } from 'vitest'
import { swapLocalePath } from '../app/utils/locale-path'

// switchLocalePath() returns '' for paths without a route (the 404 page), so the
// language switch falls back to swapping the /en prefix of the current path.
describe('swapLocalePath', () => {
  it('drops the /en prefix when switching to German', () => {
    expect(swapLocalePath('/en/does-not-exist', 'de')).toBe('/does-not-exist')
    expect(swapLocalePath('/en', 'de')).toBe('/')
    expect(swapLocalePath('/en/', 'de')).toBe('/')
  })

  it('adds the /en prefix when switching to English', () => {
    expect(swapLocalePath('/does-not-exist', 'en')).toBe('/en/does-not-exist')
    expect(swapLocalePath('/', 'en')).toBe('/en')
  })

  it('only treats a whole /en segment as the prefix', () => {
    expect(swapLocalePath('/english-notes', 'de')).toBe('/english-notes')
    expect(swapLocalePath('/english-notes', 'en')).toBe('/en/english-notes')
  })

  it('keeps a path that is already in the target language', () => {
    expect(swapLocalePath('/en/missing', 'en')).toBe('/en/missing')
    expect(swapLocalePath('/missing', 'de')).toBe('/missing')
  })
})
