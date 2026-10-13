import type { RouterConfig } from '@nuxt/schema'

// Read once on load; the brand book asks for no movement under reduced motion.
const prefersReducedMotion =
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Links to a section ("Kontakt" → #contact) scroll there smoothly. Nuxt applies this only to
 * hash scrolling; a change of page still starts at the top instantly.
 */
export default {
  scrollBehaviorType: prefersReducedMotion ? 'auto' : 'smooth',
} satisfies RouterConfig
