import { describe, expect, it } from 'vitest'
import de from '../i18n/locales/de.json'
import en from '../i18n/locales/en.json'

type Messages = { [key: string]: string | Messages }

function flatten(messages: Messages, prefix = ''): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [key, value] of Object.entries(messages)) {
    const path = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'string') out[path] = value
    else Object.assign(out, flatten(value, path))
  }
  return out
}

const locales = { de: flatten(de as Messages), en: flatten(en as Messages) }
const placeholders = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort()

describe('locale files', () => {
  it('have the same keys in German and English', () => {
    expect(Object.keys(locales.en).sort()).toEqual(Object.keys(locales.de).sort())
  })

  it('have no empty values', () => {
    for (const [locale, messages] of Object.entries(locales)) {
      for (const [key, value] of Object.entries(messages)) {
        expect(value.trim(), `${locale}:${key}`).not.toBe('')
      }
    }
  })

  it('contain no characters that vue-i18n reads as syntax', () => {
    for (const [locale, messages] of Object.entries(locales)) {
      for (const [key, value] of Object.entries(messages)) {
        expect(value, `${locale}:${key}`).not.toMatch(/[@|]/)
        expect(value.replace(/\{\w+\}/g, ''), `${locale}:${key}`).not.toMatch(/[{}]/)
      }
    }
  })

  it('use the same placeholders in both languages', () => {
    for (const [key, value] of Object.entries(locales.de)) {
      expect(placeholders(locales.en[key] ?? ''), key).toEqual(placeholders(value))
    }
  })
})
