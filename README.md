# kraftpatrick.dev

The source of my personal site: who I am, what I build and how to reach me. German at `/`, English at `/en`.

## Stack

Nuxt 4, Vue 3, TypeScript, SCSS and `@nuxtjs/i18n`. Static output from `nuxt generate`, fonts self-hosted, no tracking.

The look comes from my design system "Patrick Kraft": Night and Day themes, Newsreader, Geist and Geist Mono.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # content, i18n, theme, component and legal tests
npm run generate   # static site in .output/public
```

## Where things live

| What | Where |
| --- | --- |
| Projects, timeline, stack, at-a-glance facts | `app/data/*.ts`, German and English side by side |
| Interface text, headings, page copy | `i18n/locales/de.json`, `i18n/locales/en.json` |
| Impressum and Datenschutz | `app/data/legal.ts` |
| Design tokens and component styles | `app/assets/scss/` |
| Portrait, avatar and OG image | `npm run images -- <photo>` writes `public/images/` |

## Going live

Upload `.output/public` to any static host.

## License

Code: MIT. Fonts: SIL Open Font License, see `public/fonts/licenses/`.
