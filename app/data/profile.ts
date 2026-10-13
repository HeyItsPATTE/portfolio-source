import type { Locale } from './types'

export const profile = {
  name: 'Patrick Kraft',
  email: 'kraftpatrick@gmx.net',
  linkedin: 'https://www.linkedin.com/in/patrick-kraft-8a1472393/',
  github: 'https://github.com/HeyItsPATTE',
  discord: 'heyitspatte',
  portrait: '/images/patrick-kraft.webp',
  avatar: '/images/patrick-kraft-avatar.webp',
  siteUrl: 'https://kraftpatrick.dev',
} as const

export const CV_SUBJECT: Record<Locale, string> = {
  de: 'Anfrage Lebenslauf',
  en: 'CV request',
}

export function mailto(subject?: string): string {
  const base = `mailto:${profile.email}`
  return subject ? `${base}?subject=${encodeURIComponent(subject)}` : base
}

/** The CV is never published; this opens an email asking for it. */
export function cvMailto(locale: Locale): string {
  return mailto(CV_SUBJECT[locale])
}
