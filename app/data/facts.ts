import { same, type Fact } from './types'

/** The "at a glance" row on Home. */
export const facts: Fact[] = [
  { label: { de: 'rolle', en: 'role' }, value: { de: 'Fachinformatiker AE in Umschulung', en: 'Application developer in training' } },
  { label: { de: 'umschulung', en: 'training' }, value: { de: 'WBS Training, seit 01/2026', en: 'WBS Training, since 01/2026' } },
  { label: { de: 'abschluss', en: 'graduation' }, value: { de: 'IHK, voraussichtlich 2028', en: 'IHK, expected 2028' } },
  { label: { de: 'wohnort', en: 'based in' }, value: same('Recklinghausen, NRW') },
  { label: { de: 'sprachen', en: 'languages' }, value: { de: 'Deutsch, Englisch, Italienisch', en: 'German, English, Italian' } },
]
