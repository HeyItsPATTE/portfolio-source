import type { Locale, Localized } from '~/data/types'

/** Picks the current language's value from a Localized<T> in data files. */
export function useLocalized() {
  const { locale } = useI18n()
  const current = computed(() => locale.value as Locale)
  const l = <T>(value: Localized<T>): T => value[current.value]
  return { locale: current, l }
}
