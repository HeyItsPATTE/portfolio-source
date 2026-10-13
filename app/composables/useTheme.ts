import { THEME_STORAGE_KEY } from '~/utils/preferences'
import { nextTheme, type Theme } from '~/utils/theme'

export function useTheme() {
  const theme = useState<Theme>('theme', () => 'night')

  /** After hydration, adopt what the head script already decided. Client only. */
  function syncFromDocument() {
    theme.value = document.documentElement.getAttribute('data-theme') === 'day' ? 'day' : 'night'
  }

  /** Flip the theme and remember the explicit choice. Client only. */
  function toggle() {
    const next = nextTheme(theme.value)
    theme.value = next
    document.documentElement.setAttribute('data-theme', next)
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next)
    } catch {
      // Storage can be blocked; the choice then lasts until the tab closes.
    }
  }

  return { theme, toggle, syncFromDocument }
}
