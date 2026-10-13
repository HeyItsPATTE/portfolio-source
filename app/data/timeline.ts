import { same, type TimelineEntry } from './types'

/** Newest first within each kind. */
export const timeline: TimelineEntry[] = [
  {
    kind: 'work',
    period: same('2026–2028'),
    title: { de: 'Umschulung Fachinformatiker AE (IHK)', en: 'Retraining: application developer (IHK)' },
    place: 'WBS Training AG, Marburg',
    text: {
      de: 'Praktikum vom 05.04. bis 15.11.2027, Abschluss voraussichtlich 2028.',
      en: 'Internship from 5 April to 15 November 2027, graduation expected in 2028.',
    },
    onHome: true,
  },
  {
    kind: 'work',
    period: same('2025'),
    title: { de: 'Mitarbeiter Pulverproduktion', en: 'Powder production' },
    place: 'Capricorn Scientific GmbH, Dreihausen',
    text: {
      de: 'Produktionsanlagen nach festgelegten Qualitätsvorgaben bedient.',
      en: 'Ran production equipment to fixed quality specifications.',
    },
    onHome: true,
  },
  {
    kind: 'work',
    period: same('2023–2025'),
    title: { de: 'Laborwerker Bulkproduktion', en: 'Bulk production, GMP cleanroom' },
    place: 'CSL Behring GmbH, Marburg',
    text: {
      de: 'Komplexe Anlagen im Reinraum unter GMP bedient und jeden Schritt in MES und Prozessleitsystem dokumentiert.',
      en: 'Ran complex equipment in a GMP cleanroom and documented every step in MES and the process control system.',
    },
    textLong: {
      de: 'Komplexe Anlagen im Reinraum unter GMP bedient, Prozessführung und Dokumentation mit MES und Prozessleitsystem, Arbeit mit pH-Messsystemen nach strengen Qualitätsstandards.',
      en: 'Ran complex equipment in a GMP cleanroom, led and documented processes in MES and the process control system, and worked with pH measurement systems to strict quality standards.',
    },
    onHome: true,
  },
  {
    kind: 'work',
    period: same('2020–2023'),
    title: { de: 'Servicekraft', en: 'Service staff' },
    place: 'Stadtallendorf',
    onHome: false,
  },
  {
    kind: 'education',
    period: same('2019–2020'),
    title: { de: 'Ausbildung zum Erzieher', en: 'Training as an educator (Erzieher)' },
    place: 'BerufsschulCampus Schwalmstadt',
    text: { de: 'Nicht abgeschlossen.', en: 'Not completed.' },
    onHome: false,
  },
  {
    kind: 'education',
    period: same('2016–2019'),
    title: { de: 'Staatlich geprüfter Sozialassistent', en: 'State-certified social assistant' },
    place: 'BerufsschulCampus Schwalmstadt',
    onHome: false,
  },
  {
    kind: 'education',
    period: same('2006–2016'),
    title: same('Realschulabschluss'),
    place: 'Martin-von-Tours-Schule, Neustadt (Hessen)',
    onHome: false,
  },
]
