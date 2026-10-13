import { THEME_STORAGE_KEY } from './preferences'

export type Theme = 'night' | 'day'

export function isTheme(value: unknown): value is Theme {
  return value === 'night' || value === 'day'
}

/** A stored choice wins, then the system setting; Night is the default. */
export function resolveInitialTheme(stored: string | null | undefined, prefersLight: boolean): Theme {
  if (isTheme(stored)) return stored
  return prefersLight ? 'day' : 'night'
}

export function nextTheme(theme: Theme): Theme {
  return theme === 'night' ? 'day' : 'night'
}

/**
 * Runs in <head> before the first paint so the page never flashes the wrong theme.
 * Same rules as resolveInitialTheme. Every browser API is guarded: storage throws in
 * some private modes and old browsers have no matchMedia.
 */
export const themeInitScript = `(function(){var s=null,l=false;try{s=localStorage.getItem('${THEME_STORAGE_KEY}')}catch(e){}try{l=window.matchMedia('(prefers-color-scheme: light)').matches}catch(e){}document.documentElement.setAttribute('data-theme',s==='night'||s==='day'?s:l?'day':'night')})()`
