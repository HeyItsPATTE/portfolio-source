import type { Locale } from '~/data/types'

const EN_PREFIX = /^\/en(?=\/|$)/

/**
 * The same path in the other language, for paths without a route (the 404 page),
 * where switchLocalePath() has nothing to resolve. German has no prefix, English has /en.
 */
export function swapLocalePath(path: string, target: Locale): string {
  const unprefixed = path.replace(EN_PREFIX, '') || '/'
  if (target === 'de') return unprefixed.length > 1 ? unprefixed.replace(/\/$/, '') : '/'
  return unprefixed === '/' ? '/en' : `/en${unprefixed}`
}
