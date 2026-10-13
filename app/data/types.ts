export type Locale = 'de' | 'en'
export type Localized<T = string> = Record<Locale, T>

export const LOCALES: readonly Locale[] = ['de', 'en']

/** The same text in both languages: numbers, names, technology terms. */
export function same(text: string): Localized {
  return { de: text, en: text }
}

export type ProjectSlug = 'lacnr' | 'berrybase' | 'undercrown' | 'survive-tonight' | 'berrybit-website'

export interface Project {
  slug: ProjectSlug
  title: string
  meta: Localized
  summary: Localized
  /** At most four, in the source's spelling. */
  tags: string[]
  /** Public URL only; private projects have none. */
  href?: string
  /** Shown on Home. */
  featured: boolean
}

export interface TimelineEntry {
  kind: 'work' | 'education'
  /** En dash, no spaces: "2023–2025". */
  period: Localized
  title: Localized
  place: string
  /** Short text, used on Home and About. */
  text?: Localized
  /** Replaces text on About when present. */
  textLong?: Localized
  onHome: boolean
}

export interface StackGroup {
  label: Localized
  items: string[]
}

export interface Fact {
  label: Localized
  value: Localized
}
