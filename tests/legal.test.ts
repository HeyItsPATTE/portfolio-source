import { describe, expect, it } from 'vitest'
import { datenschutz, impressum, IMPRESSUM_ADDRESS, LEGAL_UPDATED, SECOND_CONTACT_URL } from '../app/data/legal'
import { profile } from '../app/data/profile'
import { LANGUAGE_COOKIE, THEME_STORAGE_KEY } from '../app/utils/preferences'

const text = (sections: typeof impressum) =>
  sections.flatMap((s) => [s.heading, ...s.paragraphs, ...(s.links ?? []).map((l) => `${l.label} ${l.href}`)]).join('\n')

describe('Impressum', () => {
  it('names Patrick with the c/o address and email', () => {
    const all = text(impressum)
    expect(all).toContain(profile.name)
    expect(all).toContain(IMPRESSUM_ADDRESS)
    expect(all).toContain(profile.email)
  })

  it('links the second contact way at online-impressum.de in a new tab', () => {
    const links = impressum.flatMap((s) => s.links ?? [])
    expect(links).toContainEqual(expect.objectContaining({ href: SECOND_CONTACT_URL, external: true }))
    expect(links).toContainEqual(expect.objectContaining({ href: `mailto:${profile.email}`, external: false }))
  })

  it('has no supervisory-authority line that would go stale after the move', () => {
    expect(text(impressum)).not.toMatch(/Aufsichtsbehörde|Medienanstalt/)
  })
})

describe('Datenschutz', () => {
  it('names the controller with the c/o address', () => {
    expect(text(datenschutz)).toContain(IMPRESSUM_ADDRESS)
  })

  it('names exactly the cookie and storage key the code uses', () => {
    const all = text(datenschutz)
    expect(all).toContain(LANGUAGE_COOKIE)
    expect(all).toContain(`„${THEME_STORAGE_KEY}“`)
  })

  it('mentions the online-impressum.de contact form', () => {
    expect(text(datenschutz)).toContain('online-impressum.de')
  })
})

describe('legal sections', () => {
  it('all have a heading and content, and a dated stand', () => {
    for (const s of [...impressum, ...datenschutz]) {
      expect(s.heading.trim()).not.toBe('')
      expect(s.paragraphs.length + (s.links?.length ?? 0), s.heading).toBeGreaterThan(0)
    }
    expect(LEGAL_UPDATED).toMatch(/^\d{2}\.\d{2}\.\d{4}$/)
  })
})
