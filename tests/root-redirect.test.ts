import { describe, expect, it, vi } from 'vitest'
import { languageCookie, rootRedirectScript } from '../app/utils/root-redirect'

interface Visit {
  pathname?: string
  search?: string
  hash?: string
  cookie?: string
  languages?: string[]
  userAgent?: string
}

const BROWSER = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36'

/** Runs the head script against a fake location/navigator/document and returns where it redirects, if anywhere. */
function visit({ pathname = '/', search = '', hash = '', cookie = '', languages = ['de-DE'], userAgent = BROWSER }: Visit): string | null {
  const replace = vi.fn()
  const location = { pathname, search, hash, replace }
  const navigator = { languages, language: languages[0], userAgent }
  const document = { cookie }
  new Function('location', 'navigator', 'document', rootRedirectScript)(location, navigator, document)
  return replace.mock.calls[0]?.[0] ?? null
}

describe('rootRedirectScript', () => {
  it('sends an English browser from / to /en on its first visit', () => {
    expect(visit({ languages: ['en-US', 'en'] })).toBe('/en')
  })

  it('leaves a German browser on /', () => {
    expect(visit({ languages: ['de-DE', 'de'] })).toBeNull()
  })

  it('remembers an earlier choice of English', () => {
    expect(visit({ cookie: 'i18n_redirected=en', languages: ['de-DE'] })).toBe('/en')
  })

  it('remembers an earlier choice of German over an English browser', () => {
    expect(visit({ cookie: 'other=1; i18n_redirected=de', languages: ['en-US'] })).toBeNull()
  })

  it('uses the first supported language in the browser list', () => {
    expect(visit({ languages: ['fr-FR', 'en-GB'] })).toBe('/en')
    expect(visit({ languages: ['fr-FR', 'de'] })).toBeNull()
  })

  it('sends browsers that prefer neither German nor English to /en', () => {
    expect(visit({ languages: ['fr-FR'] })).toBe('/en')
    expect(visit({ languages: [] })).toBe('/en')
  })

  it('leaves crawlers on the German home so it stays indexed', () => {
    for (const userAgent of [
      'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
      'LinkedInBot/1.0 (compatible; Mozilla/5.0; Apache-HttpClient +http://www.linkedin.com)',
    ]) {
      expect(visit({ languages: ['en-US'], userAgent }), userAgent).toBeNull()
    }
  })

  it('acts only on the root path and keeps query and hash', () => {
    expect(visit({ pathname: '/about', languages: ['en'] })).toBeNull()
    expect(visit({ languages: ['en'], search: '?ref=cv', hash: '#contact' })).toBe('/en?ref=cv#contact')
  })
})

describe('languageCookie', () => {
  it('remembers an explicit language choice for a year, site-wide', () => {
    expect(languageCookie('en')).toBe('i18n_redirected=en; path=/; max-age=31536000; samesite=lax')
    expect(languageCookie('de')).toBe('i18n_redirected=de; path=/; max-age=31536000; samesite=lax')
  })

  it('is read back by the redirect script', () => {
    const cookie = languageCookie('de').split(';')[0]
    expect(visit({ cookie, languages: ['en-US'] })).toBeNull()
  })
})
