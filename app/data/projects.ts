import { same, type Project } from './types'

export const projects: Project[] = [
  {
    slug: 'lacnr',
    title: 'LACNR',
    meta: same('web · .net 10 · 2026'),
    summary: {
      de: 'Website einer FiveM-Community, zu zweit gebaut: erst Vue 3 mit eigener API, dann von mir nach Blazor auf .NET 10 portiert, mit xUnit-Tests und Docker. 128 der 142 Commits sind von mir.',
      en: 'Website for a FiveM community, built as a team of two: first Vue 3 with its own API, then ported by me to Blazor on .NET 10 with xUnit tests and Docker. 128 of 142 commits are mine.',
    },
    tags: ['Blazor', '.NET 10', 'Vue 3', 'xUnit'],
    featured: true,
  },
  {
    slug: 'berrybase',
    title: 'BerryBase',
    meta: { de: 'desktop-app · c# · 2026', en: 'desktop app · c# · 2026' },
    summary: {
      de: 'Ein Werkzeug für unsere Hobby-Spielegruppe BerryBit, allein gebaut: Avalonia mit MVVM, Live-Daten über SignalR, automatische Updates über Velopack, Builds für Windows und Linux.',
      en: 'A tool for BerryBit, our hobby game group, built alone: Avalonia with MVVM, live data over SignalR, auto-updates through Velopack, builds for Windows and Linux.',
    },
    tags: ['C#', 'Avalonia', 'MVVM', 'SignalR'],
    href: 'https://github.com/BerryBitStudios/berrybase-releases',
    featured: true,
  },
  {
    slug: 'undercrown',
    title: 'Undercrown',
    meta: { de: 'spiel · unity · in arbeit', en: 'game · unity · in progress' },
    summary: {
      de: 'Mein eigenes Spiel, an dem ich in meiner Freizeit baue: ein Low-Poly-Survivalspiel im Mittelalter in Unity und C#, von Anfang an für Multiplayer ausgelegt.',
      en: 'My own game, built in my free time: a low-poly medieval survival game in Unity and C#, designed for multiplayer from day one.',
    },
    tags: ['Unity', 'C#', 'Multiplayer'],
    featured: true,
  },
  {
    slug: 'survive-tonight',
    title: 'Survive Tonight',
    meta: same('game jam · 2025'),
    summary: {
      de: 'Ein kurzer 2D-Horror-Prototyp, in wenigen Tagen mit einem Freund für den Scream Jam 2025 gebaut. Spielbar auf itch.io für Windows, macOS und Linux.',
      en: 'A short 2D horror prototype made in a few days with a friend for Scream Jam 2025. Playable on itch.io for Windows, macOS and Linux.',
    },
    tags: ['Game jam', '2D', 'Horror'],
    href: 'https://berrybit.itch.io/survive-tonight',
    featured: false,
  },
  {
    slug: 'berrybit-website',
    title: 'berrybit.dev',
    meta: same('web · 2026'),
    summary: {
      de: 'Die zweisprachige Website unserer Hobby-Spielegruppe BerryBit, mit Seiten für Spiele, News und das Team.',
      en: 'The bilingual website of BerryBit, our hobby game group, with pages for games, news and the team.',
    },
    tags: ['Nuxt', 'Vue', 'i18n'],
    href: 'https://berrybit.dev',
    featured: false,
  },
]
