import { describe, expect, it } from 'vitest'
import { isPlainLeftClick } from '../app/utils/events'

describe('isPlainLeftClick', () => {
  it('accepts a plain left click', () => {
    expect(isPlainLeftClick(new MouseEvent('click', { button: 0 }))).toBe(true)
  })

  it.each(['ctrlKey', 'metaKey', 'shiftKey', 'altKey'] as const)('rejects a click with %s, which opens a new tab or window', (key) => {
    expect(isPlainLeftClick(new MouseEvent('click', { button: 0, [key]: true }))).toBe(false)
  })

  it('rejects a middle click', () => {
    expect(isPlainLeftClick(new MouseEvent('click', { button: 1 }))).toBe(false)
  })

  it('still accepts a click the router has already handled', () => {
    const event = new MouseEvent('click', { button: 0, cancelable: true })
    event.preventDefault()
    expect(isPlainLeftClick(event)).toBe(true)
  })
})
