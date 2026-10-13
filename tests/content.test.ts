import { readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import de from '../i18n/locales/de.json'
import en from '../i18n/locales/en.json'
import { facts } from '../app/data/facts'
import { cvMailto, mailto, profile } from '../app/data/profile'
import { projects } from '../app/data/projects'
import { stack } from '../app/data/stack'
import { timeline } from '../app/data/timeline'
import { LOCALES, type Localized } from '../app/data/types'

const CLEARED = ['lacnr', 'berrybase', 'undercrown', 'survive-tonight', 'berrybit-website']
const OFF_SITE_PROJECTS = /KRFT|KRAFT Software|Home.?Office|Two Shores|IronLog/i
// Street, postcode, phone and birth date from the CV must never reach the site. Generic shapes
// on purpose: the real values must not appear in this public repo either.
const PRIVATE_DATA =
  /\b[A-ZÄÖÜ][a-zäöüß]+(?:straße|strasse|str\.|weg|gasse|allee|platz)\s+\d+\w?\b|\b\d{5}\b|\+49|\b0\d{3,4}[\s/-]?\d{3,}|\b\d{1,2}\.\d{1,2}\.19\d{2}\b/

function expectFilled(value: Localized | undefined, where: string) {
  expect(value, where).toBeDefined()
  for (const locale of LOCALES) expect(value![locale].trim(), `${where}.${locale}`).not.toBe('')
}

function sentences(text: string): number {
  return (text.match(/[.!?](\s|$)/g) ?? []).length
}

function startYear(period: Localized): number {
  return Number(period.de.match(/\d{4}/)![0])
}

function filesIn(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    return statSync(path).isDirectory() ? filesIn(path) : [path]
  })
}

describe('projects', () => {
  it('are exactly the cleared projects, in display order', () => {
    expect(projects.map((p) => p.slug)).toEqual(CLEARED)
  })

  it('feature LACNR, BerryBase and Undercrown on Home', () => {
    expect(projects.filter((p) => p.featured).map((p) => p.slug)).toEqual(['lacnr', 'berrybase', 'undercrown'])
  })

  it('have meta and a summary of at most two sentences in both languages', () => {
    for (const p of projects) {
      expectFilled(p.meta, `${p.slug}.meta`)
      expectFilled(p.summary, `${p.slug}.summary`)
      for (const locale of LOCALES) expect(sentences(p.summary[locale]), `${p.slug}.${locale}`).toBeLessThanOrEqual(2)
    }
  })

  it('have one to four tags', () => {
    for (const p of projects) {
      expect(p.tags.length, p.slug).toBeGreaterThanOrEqual(1)
      expect(p.tags.length, p.slug).toBeLessThanOrEqual(4)
    }
  })

  it('link only where a public https page exists', () => {
    expect(projects.filter((p) => p.href).map((p) => p.slug)).toEqual(['berrybase', 'survive-tonight', 'berrybit-website'])
    for (const p of projects) if (p.href) expect(p.href, p.slug).toMatch(/^https:\/\//)
  })
})

describe('timeline', () => {
  it('fills every text in both languages', () => {
    for (const e of timeline) {
      const where = `${e.place} ${e.period.de}`
      expectFilled(e.period, `${where} period`)
      expectFilled(e.title, `${where} title`)
      expect(e.place.trim(), where).not.toBe('')
      if (e.text) expectFilled(e.text, `${where} text`)
      if (e.textLong) expectFilled(e.textLong, `${where} textLong`)
    }
  })

  it('writes periods as years with an en dash and no spaces', () => {
    for (const e of timeline) {
      for (const locale of LOCALES) expect(e.period[locale]).toMatch(/^\d{4}(–\d{4})?$/)
    }
  })

  it('lists each kind newest first', () => {
    for (const kind of ['work', 'education'] as const) {
      const years = timeline.filter((e) => e.kind === kind).map((e) => startYear(e.period))
      expect(years, kind).toEqual([...years].sort((a, b) => b - a))
    }
  })

  it('shows the retraining and the two GMP jobs on Home', () => {
    expect(timeline.filter((e) => e.onHome).map((e) => e.place)).toEqual([
      'WBS Training AG, Marburg',
      'Capricorn Scientific GmbH, Dreihausen',
      'CSL Behring GmbH, Marburg',
    ])
  })
})

describe('stack and facts', () => {
  it('has five labelled stack groups without duplicates', () => {
    expect(stack).toHaveLength(5)
    for (const g of stack) {
      expectFilled(g.label, 'stack label')
      expect(g.items.length).toBeGreaterThan(0)
      expect(new Set(g.items).size).toBe(g.items.length)
    }
  })

  it('has five filled facts', () => {
    expect(facts).toHaveLength(5)
    for (const f of facts) {
      expectFilled(f.label, 'fact label')
      expectFilled(f.value, `fact ${f.label.en}`)
    }
  })
})

describe('profile', () => {
  it('builds plain and CV mailto links with an encoded subject', () => {
    expect(mailto()).toBe('mailto:kraftpatrick@gmx.net')
    expect(cvMailto('de')).toBe('mailto:kraftpatrick@gmx.net?subject=Anfrage%20Lebenslauf')
    expect(cvMailto('en')).toBe('mailto:kraftpatrick@gmx.net?subject=CV%20request')
  })
})

describe('content rules', () => {
  const everything = JSON.stringify({ projects, timeline, stack, facts, profile, de, en })

  it('never mentions projects that are off the site', () => {
    expect(everything).not.toMatch(OFF_SITE_PROJECTS)
  })

  it('contains no private data from the CV', () => {
    expect(everything).not.toMatch(PRIVATE_DATA)
  })

  it('has a private-data guard that catches CV-shaped data but not the site copy', () => {
    for (const sample of ['Musterstraße 12a', '12345 Musterstadt', '+49 170 1234567', '0170 1234567', '01.02.1990']) {
      expect(sample).toMatch(PRIVATE_DATA)
    }
    for (const allowed of ['seit 01/2026', 'vom 05.04. bis 15.11.2027', 'Recklinghausen, NRW', '128 der 142 Commits']) {
      expect(allowed).not.toMatch(PRIVATE_DATA)
    }
  })

  it('publishes no PDF files', () => {
    const pdfs = filesIn(join(process.cwd(), 'public')).filter((f) => f.toLowerCase().endsWith('.pdf'))
    expect(pdfs).toEqual([])
  })
})
