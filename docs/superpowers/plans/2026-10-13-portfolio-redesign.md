# kraftpatrick.dev Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild kraftpatrick.dev from scratch as a bilingual (German at `/`, English at `/en`), recruiter-first, static Nuxt site in Patrick's "Patrick Kraft" design system.

**Architecture:** Nuxt 4 (`app/` dir) with `@nuxtjs/i18n` (`prefix_except_default`, default `de`). Content lives in typed data files (`app/data/*.ts`, both languages side by side) plus `i18n/locales/{de,en}.json` for interface copy. The design system's tokens become CSS custom properties (Night on `:root`, Day on `[data-theme="day"]`). Its components become thin Vue SFCs over a global `kr-` stylesheet ported from the system's `bundle.css`. `nuxt generate` emits a static site.

**Tech Stack:** Nuxt 4.4, Vue 3.5, TypeScript, SCSS (`sass-embedded`), `@nuxtjs/i18n` 10.x, Vitest 4 + `@vue/test-utils` + `happy-dom`, Pillow (Python) for image generation.

**Spec:** `docs/superpowers/specs/2026-10-13-portfolio-redesign-design.md`. Read it before starting. Appendix A has all copy, Appendix B all token values.

## Global Constraints

- Node 22 / npm 10. `@nuxtjs/i18n@^10.5.0`, `vitest@^4.1.10`. No UI library, no CSS framework, no CDN, no analytics, no runtime requests to other hosts.
- Default locale `de` at `/`, English at `/en/...`. Slugs are the same in both locales: `/projects`, `/about`, `/impressum`, `/datenschutz`.
- Copy rules:
  - Sentence case; mono eyebrows and labels in lowercase.
  - Year ranges with an en dash and no spaces (`2023–2025`); a middle dot ` · ` separates meta.
  - No emoji, no exclamation marks, no hype words. First person.
  - Exact copy is in spec Appendix A or in this plan; do not invent copy.
- Design rules:
  - One lamp-filled element per screen.
  - No gradients, glows, glass, shadows at rest or left-border cards.
  - Newsreader weight ≤ 500, italic for one word per headline.
  - Text 4.5:1 in both themes (use the tokens, never new colors).
- Content rules:
  - Projects: only LACNR, BerryBase, Undercrown, Survive Tonight, BerryBit website. Never KRFT / KRAFT Software Solutions, Home Office Tracker, Two Shores, IronLog.
  - BerryBit is a hobby, never a job.
  - Patrick is not job-hunting: no availability badge, no "hire me".
  - No CV file anywhere; CV requests go through a `mailto:` with subject "Anfrage Lebenslauf" / "CV request".
  - No street address, phone, birth date or signature from the CV.
- Commits: conventional messages, **no `Co-Authored-By` or any AI attribution trailer**.
- Work on branch `redesign`. Run commands from the repo root in Git Bash.

## Review Focus

1. **Language switch on a deep page** (About, Impressum, the 404 page) must land on the same page in the other language, not on Home. Owned by Task 6, checked again in Tasks 8, 9 and 10.
2. **Broken or blocked theme storage** must still give a valid theme with no script error: a garbage value in `localStorage.theme`, `localStorage` throwing in private mode, or a browser without `matchMedia`. Owned by Task 3 (unit tests).
3. **First visit from an English browser** to `/` goes to `/en` once. After the visitor clicks "Deutsch", `/` stays German on later visits (cookie `i18n_redirected`). Owned by Task 10 (static preview check).
4. **320px wide phones:** long German words, button labels, tag rows and grids wrap instead of causing horizontal scroll. Owned by Tasks 7 and 8 (scroll-width check).
5. **Copy containing vue-i18n syntax** (`@`, `|`, stray `{}`) compiles to broken text at runtime, and placeholders must match across languages. Owned by Task 1 (unit test).

---

## File structure

```
nuxt.config.ts                      modules, i18n, head (theme script, fonts), css, prerender
vitest.config.ts                    vitest + vue plugin + happy-dom, ~ alias
package.json                        scripts: test, images
app/
  app.vue                           skip link, SiteHeader, <main>, SiteFooter, i18n head + OG defaults
  error.vue                         404/error page inside the same chrome
  assets/scss/
    main.scss                       entry: tokens, fonts, kr, layout, base reset, reveal motion
    _tokens.scss                    CSS custom properties, Night + Day
    _fonts.scss                     @font-face for the four self-hosted fonts
    _mixins.scss                    phone breakpoint, type styles, focus ring, page frame
    _kr.scss                        global port of the design system's bundle.css (kr- classes)
    _layout.scss                    .page-frame .page .block .actions .card-grid .timeline .prose
  components/
    kr/Button.vue Tag.vue SectionHeading.vue ProjectCard.vue TimelineItem.vue
    SiteHeader.vue LangSwitch.vue ThemeToggle.vue MobileMenu.vue SiteFooter.vue
    FactList.vue StackList.vue LegalPage.vue
  composables/
    useTheme.ts useLocalized.ts useNavLinks.ts usePageMeta.ts
  utils/
    preferences.ts                  THEME_STORAGE_KEY, LANGUAGE_COOKIE
    theme.ts                        Theme, isTheme, resolveInitialTheme, nextTheme, themeInitScript
  data/
    types.ts profile.ts projects.ts timeline.ts stack.ts facts.ts legal.ts
  pages/
    index.vue projects.vue about.vue impressum.vue datenschutz.vue
i18n/locales/de.json en.json
public/fonts/*.woff2  public/fonts/licenses/*.txt  public/images/{patrick-kraft,patrick-kraft-avatar}.webp  public/images/og.jpg
scripts/make-images.py
tests/i18n.test.ts content.test.ts theme.test.ts assets.test.ts components.test.ts legal.test.ts
```

Deleted from the old starter: `app/components/header.vue` and `app/assets/scss/{_reset,_typography,_variables,main}.scss` (main.scss is recreated in Task 4).

---

### Task 1: Toolchain, i18n and locale files

**Files:**
- Modify: `package.json` (deps via npm, scripts)
- Create: `vitest.config.ts`, `tests/i18n.test.ts`, `i18n/locales/de.json`, `i18n/locales/en.json`
- Modify: `nuxt.config.ts`, `app/app.vue`, `app/pages/index.vue`
- Delete: `app/components/header.vue`, `app/assets/scss/_reset.scss`, `app/assets/scss/_typography.scss`, `app/assets/scss/_variables.scss`, `app/assets/scss/main.scss`

**Interfaces:**
- Produces:
  - Locale keys used by later tasks (exact tree below).
  - `npm test` runs Vitest over `tests/**/*.test.ts`.
  - The `~` alias resolves to `app/` in tests.

- [ ] **Step 1: Install dependencies**

```bash
npm install @nuxtjs/i18n@^10.5.0
npm install -D vitest@^4.1.10 @vitejs/plugin-vue@^6.0.0 @vue/test-utils@^2.4.6 happy-dom@^20.0.0
```

Expected: both finish without `ERR!`. `package.json` now lists them.

- [ ] **Step 2: Add scripts to `package.json`**

Replace the `"scripts"` object with:

```json
  "scripts": {
    "build": "nuxt build",
    "dev": "nuxt dev",
    "generate": "nuxt generate",
    "preview": "nuxt preview",
    "postinstall": "nuxt prepare",
    "test": "vitest run",
    "images": "python scripts/make-images.py"
  },
```

- [ ] **Step 3: Create `vitest.config.ts`**

```ts
import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: { '~': fileURLToPath(new URL('./app', import.meta.url)) },
  },
  test: {
    environment: 'happy-dom',
    include: ['tests/**/*.test.ts'],
  },
})
```

- [ ] **Step 4: Remove the old starter files**

```bash
git rm -q app/components/header.vue app/assets/scss/_reset.scss app/assets/scss/_typography.scss app/assets/scss/_variables.scss app/assets/scss/main.scss
```

- [ ] **Step 5: Write the failing test `tests/i18n.test.ts`**

```ts
import { describe, expect, it } from 'vitest'
import de from '../i18n/locales/de.json'
import en from '../i18n/locales/en.json'

type Messages = { [key: string]: string | Messages }

function flatten(messages: Messages, prefix = ''): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [key, value] of Object.entries(messages)) {
    const path = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'string') out[path] = value
    else Object.assign(out, flatten(value, path))
  }
  return out
}

const locales = { de: flatten(de as Messages), en: flatten(en as Messages) }
const placeholders = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort()

describe('locale files', () => {
  it('have the same keys in German and English', () => {
    expect(Object.keys(locales.en).sort()).toEqual(Object.keys(locales.de).sort())
  })

  it('have no empty values', () => {
    for (const [locale, messages] of Object.entries(locales)) {
      for (const [key, value] of Object.entries(messages)) {
        expect(value.trim(), `${locale}:${key}`).not.toBe('')
      }
    }
  })

  it('contain no characters that vue-i18n reads as syntax', () => {
    for (const [locale, messages] of Object.entries(locales)) {
      for (const [key, value] of Object.entries(messages)) {
        expect(value, `${locale}:${key}`).not.toMatch(/[@|]/)
        expect(value.replace(/\{\w+\}/g, ''), `${locale}:${key}`).not.toMatch(/[{}]/)
      }
    }
  })

  it('use the same placeholders in both languages', () => {
    for (const [key, value] of Object.entries(locales.de)) {
      expect(placeholders(locales.en[key] ?? ''), key).toEqual(placeholders(value))
    }
  })
})
```

- [ ] **Step 6: Run it and watch it fail**

Run: `npm test`
Expected: FAIL, cannot resolve `../i18n/locales/de.json`.

- [ ] **Step 7: Create `i18n/locales/de.json`**

```json
{
  "nav": {
    "label": "Hauptnavigation",
    "projects": "Projekte",
    "about": "Über mich",
    "contact": "Kontakt"
  },
  "theme": {
    "toDay": "Tag",
    "toNight": "Nacht",
    "ariaToDay": "Tag: helles Design einschalten",
    "ariaToNight": "Nacht: dunkles Design einschalten"
  },
  "menu": {
    "open": "Menü",
    "close": "Schließen"
  },
  "skip": "Zum Inhalt springen",
  "footer": {
    "copyright": "© {year} Patrick Kraft",
    "built": "Gebaut mit Nuxt, Vue und SCSS.",
    "legal": "Impressum",
    "privacy": "Datenschutz"
  },
  "contact": {
    "emailCta": "Schreib mir eine E-Mail",
    "cvCta": "Lebenslauf anfragen",
    "discord": "Discord: heyitspatte"
  },
  "portrait": {
    "alt": "Patrick Kraft in dunklem Sakko und weißem Hemd, leicht lächelnd"
  },
  "meta": {
    "home": {
      "title": "Anwendungsentwickler in Umschulung",
      "description": "Patrick Kraft, angehender Fachinformatiker für Anwendungsentwicklung aus Recklinghausen. Projekte mit C#, .NET, Vue und Unity."
    },
    "projects": {
      "title": "Projekte",
      "description": "LACNR, BerryBase, Undercrown, Survive Tonight und die BerryBit-Website: was ich gebaut habe und womit."
    },
    "about": {
      "title": "Über mich",
      "description": "Vom GMP-Reinraum zur Softwareentwicklung: Werdegang, Ausbildung und Sprachen von Patrick Kraft."
    },
    "impressum": {
      "title": "Impressum",
      "description": "Impressum von kraftpatrick.dev."
    },
    "datenschutz": {
      "title": "Datenschutz",
      "description": "Datenschutzerklärung von kraftpatrick.dev."
    },
    "notFound": {
      "title": "Seite nicht gefunden",
      "description": "Diese Seite gibt es nicht."
    }
  },
  "home": {
    "idLine": "anwendungsentwickler in umschulung · recklinghausen",
    "heroA": "Ich baue Software mit C# und Vue und arbeite ",
    "heroEm": "genau",
    "heroB": " nach Vorgabe.",
    "lead": "Ich mache eine Umschulung zum Fachinformatiker für Anwendungsentwicklung (IHK), Abschluss voraussichtlich 2028. Davor war ich zweieinhalb Jahre in der pharmazeutischen Produktion, meist im GMP-Reinraum, wo jeder Schritt nach Vorgabe läuft und dokumentiert wird.",
    "ctaProjects": "Zu meinen Projekten",
    "factsLabel": "Auf einen Blick",
    "work": {
      "eyebrow": "01 · ausgewählte projekte",
      "title": "Ausgewählte Projekte",
      "lead": "Was ich gebaut habe, was mein Teil war und womit.",
      "all": "Alle Projekte →"
    },
    "stack": {
      "eyebrow": "02 · stack",
      "title": "Womit ich arbeite",
      "lead": "Keine Skill-Balken. Nur, was ich wirklich eingesetzt habe, in Projekten oder in der Umschulung."
    },
    "background": {
      "eyebrow": "03 · werdegang",
      "title": "Vom Reinraum zum Code",
      "lead": "Ich habe bewusst den Beruf gewechselt. Die Produktion unter GMP hat mir beigebracht, nach Vorgabe zu arbeiten, jeden Schritt zu dokumentieren und Qualität ernst zu nehmen. Das bringe ich in die Softwareentwicklung mit.",
      "more": "Ganzer Werdegang →"
    },
    "contact": {
      "eyebrow": "04 · kontakt",
      "title": "Kontakt",
      "lead": "Am besten erreichst du mich per E-Mail, meinen Lebenslauf schicke ich dir auf Anfrage. Du findest mich auch auf LinkedIn und GitHub."
    }
  },
  "projects": {
    "eyebrow": "projekte",
    "title": "Projekte",
    "lead": "Alles, was ich gebaut habe oder gerade baue: Web, Desktop und Spiele, allein und mit Freunden."
  },
  "about": {
    "eyebrow": "über mich",
    "titleA": "Vom Reinraum ",
    "titleEm": "zum Code",
    "lead": "Ich bin Patrick und werde gerade Anwendungsentwickler. Meistens arbeite ich an einem Spiel in Unity oder an etwas fürs Web.",
    "p1": "Bevor ich programmiert habe, war ich zweieinhalb Jahre in der pharmazeutischen Produktion, die meiste Zeit im GMP-Reinraum bei CSL Behring in Marburg. Dort läuft jeder Schritt genau nach Vorgabe und wird dokumentiert. Das habe ich mitgenommen: Ich plane, bevor ich baue, und halte fest, was ich gemacht habe.",
    "p2": "Seit Januar 2026 mache ich bei WBS Training eine Umschulung zum Fachinformatiker für Anwendungsentwicklung (IHK). Mein Praktikum läuft von April bis November 2027, den Abschluss mache ich voraussichtlich 2028.",
    "p3": "In meiner Freizeit baue ich Spiele. Mit Freunden betreibe ich BerryBit, eine Hobby-Spielegruppe, aus der Survive Tonight für einen Game Jam entstanden ist, und allein arbeite ich an Undercrown, einem Multiplayer-Survivalspiel in Unity.",
    "factsLabel": "Steckbrief",
    "facts": {
      "based": "wohnort",
      "languages": "sprachen",
      "outside": "in der freizeit",
      "cv": "lebenslauf"
    },
    "values": {
      "based": "Recklinghausen, NRW",
      "languages": "Deutsch (Muttersprache) · Englisch (gut) · Italienisch (gut)",
      "outside": "Spieleentwicklung mit Freunden als BerryBit",
      "cv": "Auf Anfrage per E-Mail"
    },
    "work": {
      "eyebrow": "berufserfahrung",
      "title": "Wo ich gearbeitet habe"
    },
    "education": {
      "eyebrow": "ausbildung",
      "title": "Wo ich gelernt habe"
    },
    "ctaProjects": "Zu meinen Projekten"
  },
  "legal": {
    "germanOnly": "Diese Seite gibt es nur auf Deutsch.",
    "updated": "Stand: {date}"
  },
  "error": {
    "title": "Diese Seite gibt es nicht",
    "titleGeneric": "Etwas ist schiefgelaufen",
    "text": "Vielleicht hat sich die Adresse geändert. Auf der Startseite findest du alles.",
    "home": "Zur Startseite"
  }
}
```

- [ ] **Step 8: Create `i18n/locales/en.json`**

```json
{
  "nav": {
    "label": "Main navigation",
    "projects": "Projects",
    "about": "About",
    "contact": "Contact"
  },
  "theme": {
    "toDay": "Day",
    "toNight": "Night",
    "ariaToDay": "Day: switch to the light theme",
    "ariaToNight": "Night: switch to the dark theme"
  },
  "menu": {
    "open": "Menu",
    "close": "Close"
  },
  "skip": "Skip to content",
  "footer": {
    "copyright": "© {year} Patrick Kraft",
    "built": "Built with Nuxt, Vue and SCSS.",
    "legal": "Legal notice",
    "privacy": "Privacy"
  },
  "contact": {
    "emailCta": "Write me an email",
    "cvCta": "Request my CV",
    "discord": "Discord: heyitspatte"
  },
  "portrait": {
    "alt": "Patrick Kraft in a dark blazer and white shirt, smiling slightly"
  },
  "meta": {
    "home": {
      "title": "Application developer in training",
      "description": "Patrick Kraft, application developer in training from Recklinghausen. Projects in C#, .NET, Vue and Unity."
    },
    "projects": {
      "title": "Projects",
      "description": "LACNR, BerryBase, Undercrown, Survive Tonight and the BerryBit website: what I built and with what."
    },
    "about": {
      "title": "About",
      "description": "From a GMP cleanroom to software development: Patrick Kraft's experience, education and languages."
    },
    "impressum": {
      "title": "Legal notice",
      "description": "Legal notice for kraftpatrick.dev."
    },
    "datenschutz": {
      "title": "Privacy",
      "description": "Privacy policy for kraftpatrick.dev."
    },
    "notFound": {
      "title": "Page not found",
      "description": "This page doesn't exist."
    }
  },
  "home": {
    "idLine": "application developer in training · recklinghausen",
    "heroA": "I build software in C# and Vue, and I work ",
    "heroEm": "exactly",
    "heroB": " to spec.",
    "lead": "I'm retraining as a Fachinformatiker für Anwendungsentwicklung (IHK), finishing in 2028. Before that I spent two and a half years in pharmaceutical production, mostly in a GMP cleanroom, where every step is done to spec and documented.",
    "ctaProjects": "See my projects",
    "factsLabel": "At a glance",
    "work": {
      "eyebrow": "01 · selected work",
      "title": "Selected work",
      "lead": "What I built, which part was mine, and with what.",
      "all": "All projects →"
    },
    "stack": {
      "eyebrow": "02 · stack",
      "title": "What I work with",
      "lead": "No skill bars. Only things I've used, in my projects or in my training."
    },
    "background": {
      "eyebrow": "03 · background",
      "title": "From the cleanroom to code",
      "lead": "I changed careers on purpose. Production under GMP taught me to work to spec, document every step and take quality seriously. I bring that to software.",
      "more": "Full background →"
    },
    "contact": {
      "eyebrow": "04 · contact",
      "title": "Get in touch",
      "lead": "Email is the best way to reach me, and I'll send my CV on request. I'm also on LinkedIn and GitHub."
    }
  },
  "projects": {
    "eyebrow": "projects",
    "title": "Projects",
    "lead": "Everything I've built or am building: web, desktop and games, alone and with friends."
  },
  "about": {
    "eyebrow": "about",
    "titleA": "From the cleanroom ",
    "titleEm": "to code",
    "lead": "I'm Patrick, an application developer in training. Most days I'm working on a game in Unity or on something for the web.",
    "p1": "Before I wrote code, I spent two and a half years in pharmaceutical production, most of it in a GMP cleanroom at CSL Behring in Marburg. Every step there is done exactly to spec and documented. I kept that habit: I plan before I build, and I write down what I did.",
    "p2": "Since January 2026 I'm retraining as a Fachinformatiker für Anwendungsentwicklung (IHK) at WBS Training. My internship runs from April to November 2027, and I expect to finish in 2028.",
    "p3": "In my free time I build games. With friends I run BerryBit, a hobby game group that made Survive Tonight for a game jam, and on my own I'm working on Undercrown, a multiplayer survival game in Unity.",
    "factsLabel": "Profile",
    "facts": {
      "based": "based in",
      "languages": "languages",
      "outside": "outside work",
      "cv": "cv"
    },
    "values": {
      "based": "Recklinghausen, NRW",
      "languages": "German (native) · English (good) · Italian (good)",
      "outside": "Game development with friends as BerryBit",
      "cv": "On request by email"
    },
    "work": {
      "eyebrow": "experience",
      "title": "Where I worked"
    },
    "education": {
      "eyebrow": "education",
      "title": "Where I learned"
    },
    "ctaProjects": "See my projects"
  },
  "legal": {
    "germanOnly": "This page is only available in German, which is the legally binding version.",
    "updated": "Last updated: {date}"
  },
  "error": {
    "title": "This page doesn't exist",
    "titleGeneric": "Something went wrong",
    "text": "The address may have changed. You'll find everything on the home page.",
    "home": "Go to the home page"
  }
}
```

- [ ] **Step 9: Run the tests and watch them pass**

Run: `npm test`
Expected: PASS, 4 tests in `tests/i18n.test.ts`.

- [ ] **Step 10: Replace `nuxt.config.ts`**

```ts
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/i18n'],
  i18n: {
    baseUrl: 'https://kraftpatrick.dev',
    defaultLocale: 'de',
    strategy: 'prefix_except_default',
    locales: [
      { code: 'de', language: 'de-DE', name: 'Deutsch', file: 'de.json' },
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
    ],
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
      fallbackLocale: 'de',
    },
  },
})
```

- [ ] **Step 11: Replace `app/app.vue` and `app/pages/index.vue` with placeholders**

`app/app.vue`:

```vue
<template>
  <NuxtPage />
</template>
```

`app/pages/index.vue` (replaced in Task 7):

```vue
<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <h1>{{ t('nav.projects') }}</h1>
</template>
```

- [ ] **Step 12: Generate and check both locales render**

```bash
npm run generate
grep -c "Projekte" .output/public/index.html
grep -c "Projects" .output/public/en/index.html
```

Expected: generate ends with "You can now deploy .output/public". Both `grep -c` print a number ≥ 1.

- [ ] **Step 13: Commit**

```bash
git add -A -- package.json package-lock.json vitest.config.ts nuxt.config.ts i18n tests app
git commit -m "chore: set up i18n, vitest and bilingual locale files"
```

---

### Task 2: Content data

**Files:**
- Create: `app/data/types.ts`, `app/data/profile.ts`, `app/data/projects.ts`, `app/data/timeline.ts`, `app/data/stack.ts`, `app/data/facts.ts`
- Test: `tests/content.test.ts`

**Interfaces:**
- Consumes: `i18n/locales/{de,en}.json` (Task 1), scanned by the content-rule test.
- Produces:
  - `types.ts`: `type Locale = 'de' | 'en'`; `type Localized<T = string> = Record<Locale, T>`; `const LOCALES: readonly Locale[]`; `function same(text: string): Localized`.
  - `types.ts` interfaces: `Project { slug: ProjectSlug; title: string; meta: Localized; summary: Localized; tags: string[]; href?: string; featured: boolean }`, `TimelineEntry { kind: 'work' | 'education'; period: Localized; title: Localized; place: string; text?: Localized; textLong?: Localized; onHome: boolean }`, `StackGroup { label: Localized; items: string[] }`, `Fact { label: Localized; value: Localized }`.
  - `profile.ts`: `profile { name, email, linkedin, github, discord, portrait, avatar, siteUrl }`, `CV_SUBJECT: Record<Locale, string>`, `mailto(subject?: string): string`, `cvMailto(locale: Locale): string`.
  - Data exports: `projects: Project[]`, `timeline: TimelineEntry[]`, `stack: StackGroup[]`, `facts: Fact[]`.

- [ ] **Step 1: Write the failing test `tests/content.test.ts`**

```ts
import { readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import de from '../i18n/locales/de.json'
import en from '../i18n/locales/en.json'
import { facts } from '../app/data/facts'
import { cvMailto, mailto, profile } from '../app/data/profile'
import { projects } from '../app/data/projects'
import { stack } from '../app/data/stack'
import { timeline } from '../app/data/timeline'
import { LOCALES, type Localized } from '../app/data/types'

const CLEARED = ['lacnr', 'berrybase', 'undercrown', 'survive-tonight', 'berrybit-website']
const OFF_SITE_PROJECTS = /KRFT|KRAFT Software|Home.?Office|Two Shores|IronLog/i
// Street, postcode, phone and birth date from the CV must never reach the site. Generic shapes
// on purpose: the real values must not appear in this public repo either.
const PRIVATE_DATA =
  /\b[A-ZÄÖÜ][a-zäöüß]+(?:straße|strasse|str\.|weg|gasse|allee|platz)\s+\d+\w?\b|\b\d{5}\b|\+49|\b0\d{3,4}[\s/-]?\d{3,}|\b\d{1,2}\.\d{1,2}\.19\d{2}\b/

function expectFilled(value: Localized | undefined, where: string) {
  expect(value, where).toBeDefined()
  for (const locale of LOCALES) expect(value![locale].trim(), `${where}.${locale}`).not.toBe('')
}

function sentences(text: string): number {
  return (text.match(/[.!?](\s|$)/g) ?? []).length
}

function startYear(period: Localized): number {
  return Number(period.de.match(/\d{4}/)![0])
}

function filesIn(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    return statSync(path).isDirectory() ? filesIn(path) : [path]
  })
}

describe('projects', () => {
  it('are exactly the cleared projects, in display order', () => {
    expect(projects.map((p) => p.slug)).toEqual(CLEARED)
  })

  it('feature LACNR, BerryBase and Undercrown on Home', () => {
    expect(projects.filter((p) => p.featured).map((p) => p.slug)).toEqual(['lacnr', 'berrybase', 'undercrown'])
  })

  it('have meta and a summary of at most two sentences in both languages', () => {
    for (const p of projects) {
      expectFilled(p.meta, `${p.slug}.meta`)
      expectFilled(p.summary, `${p.slug}.summary`)
      for (const locale of LOCALES) expect(sentences(p.summary[locale]), `${p.slug}.${locale}`).toBeLessThanOrEqual(2)
    }
  })

  it('have one to four tags', () => {
    for (const p of projects) {
      expect(p.tags.length, p.slug).toBeGreaterThanOrEqual(1)
      expect(p.tags.length, p.slug).toBeLessThanOrEqual(4)
    }
  })

  it('link only where a public https page exists', () => {
    expect(projects.filter((p) => p.href).map((p) => p.slug)).toEqual(['berrybase', 'survive-tonight', 'berrybit-website'])
    for (const p of projects) if (p.href) expect(p.href, p.slug).toMatch(/^https:\/\//)
  })
})

describe('timeline', () => {
  it('fills every text in both languages', () => {
    for (const e of timeline) {
      const where = `${e.place} ${e.period.de}`
      expectFilled(e.period, `${where} period`)
      expectFilled(e.title, `${where} title`)
      expect(e.place.trim(), where).not.toBe('')
      if (e.text) expectFilled(e.text, `${where} text`)
      if (e.textLong) expectFilled(e.textLong, `${where} textLong`)
    }
  })

  it('writes periods as years with an en dash and no spaces', () => {
    for (const e of timeline) {
      for (const locale of LOCALES) expect(e.period[locale]).toMatch(/^\d{4}(–\d{4})?$/)
    }
  })

  it('lists each kind newest first', () => {
    for (const kind of ['work', 'education'] as const) {
      const years = timeline.filter((e) => e.kind === kind).map((e) => startYear(e.period))
      expect(years, kind).toEqual([...years].sort((a, b) => b - a))
    }
  })

  it('shows the retraining and the two GMP jobs on Home', () => {
    expect(timeline.filter((e) => e.onHome).map((e) => e.place)).toEqual([
      'WBS Training AG, Marburg',
      'Capricorn Scientific GmbH, Dreihausen',
      'CSL Behring GmbH, Marburg',
    ])
  })
})

describe('stack and facts', () => {
  it('has five labelled stack groups without duplicates', () => {
    expect(stack).toHaveLength(5)
    for (const g of stack) {
      expectFilled(g.label, 'stack label')
      expect(g.items.length).toBeGreaterThan(0)
      expect(new Set(g.items).size).toBe(g.items.length)
    }
  })

  it('has five filled facts', () => {
    expect(facts).toHaveLength(5)
    for (const f of facts) {
      expectFilled(f.label, 'fact label')
      expectFilled(f.value, `fact ${f.label.en}`)
    }
  })
})

describe('profile', () => {
  it('builds plain and CV mailto links with an encoded subject', () => {
    expect(mailto()).toBe('mailto:kraftpatrick@gmx.net')
    expect(cvMailto('de')).toBe('mailto:kraftpatrick@gmx.net?subject=Anfrage%20Lebenslauf')
    expect(cvMailto('en')).toBe('mailto:kraftpatrick@gmx.net?subject=CV%20request')
  })
})

describe('content rules', () => {
  const everything = JSON.stringify({ projects, timeline, stack, facts, profile, de, en })

  it('never mentions projects that are off the site', () => {
    expect(everything).not.toMatch(OFF_SITE_PROJECTS)
  })

  it('contains no private data from the CV', () => {
    expect(everything).not.toMatch(PRIVATE_DATA)
  })

  it('publishes no PDF files', () => {
    const pdfs = filesIn(join(process.cwd(), 'public')).filter((f) => f.toLowerCase().endsWith('.pdf'))
    expect(pdfs).toEqual([])
  })
})
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npm test -- tests/content.test.ts`
Expected: FAIL, cannot resolve `../app/data/facts`.

- [ ] **Step 3: Create `app/data/types.ts`**

```ts
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
```

- [ ] **Step 4: Create `app/data/profile.ts`**

```ts
import type { Locale } from './types'

export const profile = {
  name: 'Patrick Kraft',
  email: 'kraftpatrick@gmx.net',
  linkedin: 'https://www.linkedin.com/in/patrick-kraft-8a1472393/',
  github: 'https://github.com/HeyItsPATTE',
  discord: 'heyitspatte',
  portrait: '/images/patrick-kraft.webp',
  avatar: '/images/patrick-kraft-avatar.webp',
  siteUrl: 'https://kraftpatrick.dev',
} as const

export const CV_SUBJECT: Record<Locale, string> = {
  de: 'Anfrage Lebenslauf',
  en: 'CV request',
}

export function mailto(subject?: string): string {
  const base = `mailto:${profile.email}`
  return subject ? `${base}?subject=${encodeURIComponent(subject)}` : base
}

/** The CV is never published; this opens an email asking for it. */
export function cvMailto(locale: Locale): string {
  return mailto(CV_SUBJECT[locale])
}
```

- [ ] **Step 5: Create `app/data/projects.ts`**

```ts
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
```

- [ ] **Step 6: Create `app/data/timeline.ts`**

```ts
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
```

- [ ] **Step 7: Create `app/data/stack.ts` and `app/data/facts.ts`**

`app/data/stack.ts`:

```ts
import { same, type StackGroup } from './types'

/** Only what was used in projects or the retraining. No levels, no bars. */
export const stack: StackGroup[] = [
  { label: { de: 'sprachen', en: 'languages' }, items: ['C#', 'Java', 'TypeScript', 'JavaScript', 'SQL'] },
  { label: same('frameworks'), items: ['.NET', 'Blazor', 'Avalonia', 'Vue', 'Nuxt', 'Unity'] },
  { label: { de: 'testen', en: 'testing' }, items: ['xUnit', 'bUnit', 'Vitest', 'Playwright'] },
  { label: { de: 'werkzeuge', en: 'tools' }, items: ['Git', 'GitHub', 'Docker', 'MySQL', 'IntelliJ IDEA', 'UML'] },
  { label: { de: 'ki-werkzeuge', en: 'ai tools' }, items: ['Claude Code', 'Codex', 'Ollama'] },
]
```

`app/data/facts.ts`:

```ts
import { same, type Fact } from './types'

/** The "at a glance" row on Home. */
export const facts: Fact[] = [
  { label: { de: 'rolle', en: 'role' }, value: { de: 'Fachinformatiker AE in Umschulung', en: 'Application developer in training' } },
  { label: { de: 'umschulung', en: 'training' }, value: { de: 'WBS Training, seit 01/2026', en: 'WBS Training, since 01/2026' } },
  { label: { de: 'abschluss', en: 'graduation' }, value: { de: 'IHK, voraussichtlich 2028', en: 'IHK, expected 2028' } },
  { label: { de: 'wohnort', en: 'based in' }, value: same('Recklinghausen, NRW') },
  { label: { de: 'sprachen', en: 'languages' }, value: { de: 'Deutsch, Englisch, Italienisch', en: 'German, English, Italian' } },
]
```

- [ ] **Step 8: Run the tests and watch them pass**

Run: `npm test`
Expected: PASS, all tests in `tests/i18n.test.ts` and `tests/content.test.ts`.

- [ ] **Step 9: Commit**

```bash
git add app/data tests/content.test.ts
git commit -m "feat: add bilingual content data with content-rule tests"
```

---

### Task 3: Theme logic and the no-flash head script

**Files:**
- Create: `app/utils/preferences.ts`, `app/utils/theme.ts`, `app/composables/useTheme.ts`
- Modify: `nuxt.config.ts`
- Test: `tests/theme.test.ts`

**Interfaces:**
- Produces:
  - `preferences.ts`: `THEME_STORAGE_KEY = 'theme'`, `LANGUAGE_COOKIE = 'i18n_redirected'`.
  - `theme.ts`: `type Theme = 'night' | 'day'`; `isTheme(v: unknown): v is Theme`; `resolveInitialTheme(stored: string | null | undefined, prefersLight: boolean): Theme`; `nextTheme(t: Theme): Theme`; `themeInitScript: string`.
  - `useTheme(): { theme: Ref<Theme>; toggle(): void; syncFromDocument(): void }`.

- [ ] **Step 1: Write the failing test `tests/theme.test.ts`**

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { THEME_STORAGE_KEY } from '../app/utils/preferences'
import { isTheme, nextTheme, resolveInitialTheme, themeInitScript } from '../app/utils/theme'

const originalMatchMedia = window.matchMedia

function prefersLight(light: boolean) {
  window.matchMedia = ((query: string) => ({
    matches: light && query === '(prefers-color-scheme: light)',
    media: query,
  })) as unknown as typeof window.matchMedia
}

function runInitScript(): string | null {
  document.documentElement.removeAttribute('data-theme')
  new Function(themeInitScript)()
  return document.documentElement.getAttribute('data-theme')
}

describe('resolveInitialTheme', () => {
  it('prefers a stored valid theme over the system setting', () => {
    expect(resolveInitialTheme('day', false)).toBe('day')
    expect(resolveInitialTheme('night', true)).toBe('night')
  })

  it('follows the system setting when nothing valid is stored', () => {
    expect(resolveInitialTheme(null, true)).toBe('day')
    expect(resolveInitialTheme(undefined, false)).toBe('night')
    expect(resolveInitialTheme('blue', true)).toBe('day')
  })
})

describe('isTheme and nextTheme', () => {
  it('accept only night and day, and flip between them', () => {
    expect(isTheme('night')).toBe(true)
    expect(isTheme('dark')).toBe(false)
    expect(nextTheme('night')).toBe('day')
    expect(nextTheme('day')).toBe('night')
  })
})

describe('themeInitScript', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => {
    vi.restoreAllMocks()
    window.matchMedia = originalMatchMedia
  })

  it.each([
    [null, false, 'night'],
    [null, true, 'day'],
    ['day', false, 'day'],
    ['night', true, 'night'],
    ['blue', true, 'day'],
  ] as const)('stored=%s prefersLight=%s gives %s, same as resolveInitialTheme', (stored, light, expected) => {
    if (stored) localStorage.setItem(THEME_STORAGE_KEY, stored)
    prefersLight(light)
    expect(runInitScript()).toBe(expected)
    expect(resolveInitialTheme(stored, light)).toBe(expected)
  })

  it('still follows the system setting when storage throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied')
    })
    prefersLight(true)
    expect(runInitScript()).toBe('day')
  })

  it('falls back to night in a browser without matchMedia', () => {
    ;(window as { matchMedia?: unknown }).matchMedia = undefined
    expect(runInitScript()).toBe('night')
  })
})
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npm test -- tests/theme.test.ts`
Expected: FAIL, cannot resolve `../app/utils/preferences`.

- [ ] **Step 3: Create `app/utils/preferences.ts`**

```ts
/** localStorage key for the visitor's theme choice. Named in the Datenschutz text. */
export const THEME_STORAGE_KEY = 'theme'

/** Cookie in which @nuxtjs/i18n remembers the language choice. Named in the Datenschutz text. */
export const LANGUAGE_COOKIE = 'i18n_redirected'
```

- [ ] **Step 4: Create `app/utils/theme.ts`**

```ts
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
```

- [ ] **Step 5: Run the tests and watch them pass**

Run: `npm test`
Expected: PASS, including 10 tests in `tests/theme.test.ts`.

- [ ] **Step 6: Create `app/composables/useTheme.ts`**

```ts
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
```

- [ ] **Step 7: Wire the head script and the shared cookie name into `nuxt.config.ts`**

Replace the whole file with:

```ts
import { LANGUAGE_COOKIE } from './app/utils/preferences'
import { themeInitScript } from './app/utils/theme'

export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/i18n'],
  app: {
    head: {
      script: [{ innerHTML: themeInitScript, tagPriority: 'critical' }],
    },
  },
  i18n: {
    baseUrl: 'https://kraftpatrick.dev',
    defaultLocale: 'de',
    strategy: 'prefix_except_default',
    locales: [
      { code: 'de', language: 'de-DE', name: 'Deutsch', file: 'de.json' },
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
    ],
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: LANGUAGE_COOKIE,
      redirectOn: 'root',
      fallbackLocale: 'de',
    },
  },
})
```

- [ ] **Step 8: Check the script lands in the generated head**

```bash
npm run generate
grep -c "prefers-color-scheme: light" .output/public/index.html
```

Expected: `1`.

- [ ] **Step 9: Commit**

```bash
git add app/utils app/composables tests/theme.test.ts nuxt.config.ts
git commit -m "feat: add theme resolution and no-flash head script"
```

---

### Task 4: Fonts, images, tokens and global styles

**Files:**
- Create:
  - Fonts and licenses: `public/fonts/` (4 woff2) and `public/fonts/licenses/` (3 txt).
  - Image script and output: `scripts/make-images.py`, `public/images/` (3 files).
  - Styles: `app/assets/scss/_tokens.scss`, `_fonts.scss`, `_mixins.scss`, `_kr.scss`, `_layout.scss`, `main.scss`.
  - Test: `tests/assets.test.ts`.
- Modify: `nuxt.config.ts`

**Interfaces:**
- Consumes: `themeInitScript`, `LANGUAGE_COOKIE` (Task 3).
- Produces:
  - Global classes: `kr-*` (design system), `.page-frame`, `.page`, `.block`, `.block__head`, `.block__more`, `.actions`, `.card-grid`, `.timeline`, `.prose`, `.reveal` (with `--i` stagger index), `.skip-link`, `.visually-hidden`, `.app`.
  - SCSS mixins for components (`@use '~/assets/scss/mixins' as *;`): `phone`, `type-display`, `type-title`, `type-heading`, `type-subheading`, `type-lead`, `type-body`, `type-small`, `type-label`, `type-code`, `focus-ring`, `page-frame`.
  - Images: `/images/patrick-kraft.webp` (720²), `/images/patrick-kraft-avatar.webp` (144²), `/images/og.jpg` (1200×630).

- [ ] **Step 1: Write the failing test `tests/assets.test.ts`**

```ts
import { existsSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const PUBLIC = join(process.cwd(), 'public')

const required = [
  'fonts/Newsreader-Variable.woff2',
  'fonts/Newsreader-Italic-Variable.woff2',
  'fonts/Geist-Variable.woff2',
  'fonts/GeistMono-Variable.woff2',
  'fonts/licenses/Newsreader-OFL.txt',
  'fonts/licenses/Geist-OFL.txt',
  'fonts/licenses/GeistMono-OFL.txt',
  'images/patrick-kraft.webp',
  'images/patrick-kraft-avatar.webp',
  'images/og.jpg',
]

/** Width and height from a JPEG's start-of-frame marker. */
function jpegSize(buf: Buffer): { width: number; height: number } | null {
  let i = 2
  while (i + 9 < buf.length) {
    if (buf[i] !== 0xff) {
      i++
      continue
    }
    const marker = buf[i + 1]
    if (marker >= 0xc0 && marker <= 0xc3) return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) }
    i += 2 + buf.readUInt16BE(i + 2)
  }
  return null
}

describe('public assets', () => {
  it.each(required)('%s exists and is not empty', (file) => {
    const path = join(PUBLIC, file)
    expect(existsSync(path)).toBe(true)
    expect(statSync(path).size).toBeGreaterThan(0)
  })

  it('og.jpg is a 1200×630 JPEG', () => {
    const buf = readFileSync(join(PUBLIC, 'images/og.jpg'))
    expect([buf[0], buf[1]]).toEqual([0xff, 0xd8])
    expect(jpegSize(buf)).toEqual({ width: 1200, height: 630 })
  })
})
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npm test -- tests/assets.test.ts`
Expected: FAIL, 10 "exists" cases false and the og.jpg read throws ENOENT.

- [ ] **Step 3: Copy the design system's fonts and licenses**

The files were downloaded from the design system (https://claude.ai/artifact/SMjWQvfTSoZHiashqVTyUF, version `1791877781-637f`) into this session's scratchpad:

```bash
DS="/c/Users/pkraft/AppData/Local/Temp/claude/C--Users-pkraft-OneDrive---WBSEDU-Dokumente-Github-portfolio-source/2d001d46-fcfc-4c8a-b325-12ec33aad6b1/scratchpad/artifact-files/cd5989af-c5fe-483e-931f-b84ab0c81bdc/project"
mkdir -p public/fonts/licenses public/images
cp "$DS"/fonts/*.woff2 public/fonts/
cp "$DS"/licenses/*-OFL.txt public/fonts/licenses/
ls public/fonts public/fonts/licenses
```

Expected: four `.woff2` files and three `-OFL.txt` files listed.

If `$DS` doesn't exist, re-download them first. Use the Artifact tool, `action: "read"`, `url` = the design system above, with these `paths`:

- `project/fonts/Geist-Variable.woff2`, `project/fonts/GeistMono-Variable.woff2`
- `project/fonts/Newsreader-Variable.woff2`, `project/fonts/Newsreader-Italic-Variable.woff2`
- `project/licenses/Geist-OFL.txt`, `project/licenses/GeistMono-OFL.txt`, `project/licenses/Newsreader-OFL.txt`

Then copy from the folder the result names.

- [ ] **Step 4: Create `scripts/make-images.py`**

```python
"""Builds the portrait, the avatar and the Open Graph image in public/images.

Usage: python scripts/make-images.py <source-photo>
Needs Pillow and the fonts in public/fonts (Pillow reads woff2).
"""
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "images"
FONTS = ROOT / "public" / "fonts"

# Night tokens from the design system.
BG = (0x13, 0x12, 0x11)
INK = (0xEC, 0xE6, 0xDB)
INK_MUTED = (0xB3, 0xAB, 0x9F)
LAMP = (0xE5, 0x95, 0x72)
LINE = (0x2C, 0x2A, 0x26)


def square_crop(img: Image.Image, cx: int, cy: int, size: int) -> Image.Image:
    left = max(0, min(img.width - size, cx - size // 2))
    top = max(0, min(img.height - size, cy - size // 2))
    return img.crop((left, top, left + size, top + size))


def fitting_font(path: Path, text: str, max_width: int, size: int) -> ImageFont.FreeTypeFont:
    while size > 12:
        font = ImageFont.truetype(str(path), size)
        if font.getlength(text) <= max_width:
            return font
        size -= 2
    return ImageFont.truetype(str(path), size)


def main(source: str) -> None:
    img = Image.open(source).convert("RGB")
    OUT.mkdir(parents=True, exist_ok=True)
    side = min(img.size)

    portrait = square_crop(img, img.width // 2, img.height // 2, side).resize((720, 720), Image.LANCZOS)
    portrait.save(OUT / "patrick-kraft.webp", "WEBP", quality=82, method=6)

    # The face sits slightly above the middle of the photo.
    face = square_crop(img, round(img.width * 0.50), round(img.height * 0.39), round(side * 0.53))
    face.resize((144, 144), Image.LANCZOS).save(OUT / "patrick-kraft-avatar.webp", "WEBP", quality=85, method=6)

    og = Image.new("RGB", (1200, 630), BG)
    og.paste(portrait.resize((630, 630), Image.LANCZOS), (570, 0))
    draw = ImageDraw.Draw(og)
    draw.line([(569, 0), (569, 630)], fill=LINE, width=1)
    role = "Anwendungsentwickler in Umschulung"
    draw.text((72, 236), "Patrick Kraft", font=fitting_font(FONTS / "Newsreader-Variable.woff2", "Patrick Kraft", 450, 76), fill=INK)
    draw.text((72, 340), role, font=fitting_font(FONTS / "Geist-Variable.woff2", role, 450, 28), fill=INK_MUTED)
    draw.text((72, 520), "kraftpatrick.dev", font=ImageFont.truetype(str(FONTS / "GeistMono-Variable.woff2"), 22), fill=LAMP)
    og.save(OUT / "og.jpg", "JPEG", quality=88, optimize=True, progressive=True)

    print("wrote", ", ".join(p.name for p in sorted(OUT.iterdir())))


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit("usage: python scripts/make-images.py <source-photo>")
    main(sys.argv[1])
```

- [ ] **Step 5: Generate the images from Patrick's photo**

The photo Patrick attached on 2026-10-13 is in the scratchpad (1303×1207 webp):

```bash
npm run images -- "C:/Users/pkraft/AppData/Local/Temp/claude/C--Users-pkraft-OneDrive---WBSEDU-Dokumente-Github-portfolio-source/2d001d46-fcfc-4c8a-b325-12ec33aad6b1/scratchpad/canvas/portrait.webp"
```

Expected: `wrote og.jpg, patrick-kraft-avatar.webp, patrick-kraft.webp`.

Open `public/images/og.jpg` and `public/images/patrick-kraft-avatar.webp` with the Read tool:

- The avatar shows the face centered, not cut off at the chin or forehead. If it is, adjust `0.39` / `0.53` in the script and re-run.
- The OG image shows the name and role on the left and the photo on the right.

If the photo is missing from the scratchpad, ask Patrick to attach it again.

- [ ] **Step 6: Run the asset tests and watch them pass**

Run: `npm test -- tests/assets.test.ts`
Expected: PASS, 11 tests.

- [ ] **Step 7: Create `app/assets/scss/_tokens.scss`**

```scss
// Tokens from the "Patrick Kraft" design system (tokens.json, version 1791877781-637f).
// Night is the default on :root; Day applies when the head script sets data-theme="day".
:root {
  color-scheme: dark;

  --bg: #131211;
  --surface: #1a1917;
  --surface-raised: #22201d;
  --line: #2c2a26;
  --line-control: #777066;
  --ink: #ece6db;
  --ink-muted: #b3ab9f;
  --ink-faint: #8f887d;
  --lamp: #e59572;
  --lamp-hover: #eeac8e;
  --lamp-soft: #33231c;
  --on-lamp: #1b120e;
  --moss: #94c29c;
  --moss-soft: #1d2a20;
  --link: var(--lamp);
  --shadow-lift: 0 12px 32px -12px #000000b3;
  --focus-ring: 0 0 0 2px #131211, 0 0 0 4px #e59572;

  --font-serif: 'Newsreader', 'Iowan Old Style', Georgia, serif;
  --font-sans: 'Geist', ui-sans-serif, system-ui, 'Segoe UI', sans-serif;
  --font-mono: 'Geist Mono', ui-monospace, 'SF Mono', Menlo, monospace;

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;
  --space-16: 64px;
  --space-24: 96px;

  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-full: 9999px;

  --width-prose: 680px;
  --width-page: 1120px;
  --header-height: 64px;
  --gutter: 32px;
  --section-gap: 96px;

  --ease: cubic-bezier(0.2, 0.7, 0.2, 1);
}

:root[data-theme='day'] {
  color-scheme: light;

  --bg: #f5f1ea;
  --surface: #fbf8f3;
  --surface-raised: #ffffff;
  --line: #e3dccf;
  --line-control: #8e8679;
  --ink: #1e1b17;
  --ink-muted: #575047;
  --ink-faint: #6f675c;
  --lamp: #a0442a;
  --lamp-hover: #87381f;
  --lamp-soft: #f4e2d7;
  --on-lamp: #fffaf6;
  --moss: #2f6b40;
  --moss-soft: #e1eedf;
  --shadow-lift: 0 12px 28px -14px #1e1b1733;
  --focus-ring: 0 0 0 2px #f5f1ea, 0 0 0 4px #a0442a;
}

@media (max-width: 639.98px) {
  :root {
    --gutter: 24px;
    --section-gap: 64px;
  }
}
```

- [ ] **Step 8: Create `app/assets/scss/_fonts.scss`**

```scss
// Self-hosted, latin subset, SIL Open Font License (public/fonts/licenses).
@font-face {
  font-family: 'Newsreader';
  src: url('/fonts/Newsreader-Variable.woff2') format('woff2');
  font-weight: 200 800;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Newsreader';
  src: url('/fonts/Newsreader-Italic-Variable.woff2') format('woff2');
  font-weight: 200 800;
  font-style: italic;
  font-display: swap;
}

@font-face {
  font-family: 'Geist';
  src: url('/fonts/Geist-Variable.woff2') format('woff2');
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Geist Mono';
  src: url('/fonts/GeistMono-Variable.woff2') format('woff2');
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
}
```

- [ ] **Step 9: Create `app/assets/scss/_mixins.scss`**

```scss
// Mixins and constants only: safe to @use from any component, emits no CSS by itself.

// The design system switches the header nav and timeline layout at 640px.
$bp-phone: 640px;

@mixin phone {
  @media (max-width: #{$bp-phone - 0.02px}) {
    @content;
  }
}

@mixin type-display {
  font-family: var(--font-serif);
  font-size: 64px;
  line-height: 68px;
  font-weight: 400;
  letter-spacing: -0.02em;

  @include phone {
    font-size: 44px;
    line-height: 48px;
  }
}

@mixin type-title {
  font-family: var(--font-serif);
  font-size: 44px;
  line-height: 50px;
  font-weight: 400;
  letter-spacing: -0.015em;

  @include phone {
    font-size: 34px;
    line-height: 40px;
  }
}

@mixin type-heading {
  font-family: var(--font-serif);
  font-size: 30px;
  line-height: 36px;
  font-weight: 400;
  letter-spacing: -0.01em;
}

@mixin type-subheading {
  font-family: var(--font-serif);
  font-size: 21px;
  line-height: 28px;
  font-weight: 500;
}

@mixin type-lead {
  font-family: var(--font-sans);
  font-size: 19px;
  line-height: 30px;
  font-weight: 400;
}

@mixin type-body {
  font-family: var(--font-sans);
  font-size: 16px;
  line-height: 27px;
  font-weight: 400;
}

@mixin type-small {
  font-family: var(--font-sans);
  font-size: 14px;
  line-height: 22px;
  font-weight: 400;
}

@mixin type-label {
  font-family: var(--font-mono);
  font-size: 12px;
  line-height: 16px;
  font-weight: 500;
  letter-spacing: 0.06em;
}

@mixin type-code {
  font-family: var(--font-mono);
  font-size: 14px;
  line-height: 22px;
  font-weight: 400;
}

@mixin focus-ring {
  outline: none;
  box-shadow: var(--focus-ring);
}

@mixin page-frame {
  box-sizing: border-box;
  width: 100%;
  max-width: calc(var(--width-page) + 2 * var(--gutter));
  margin-inline: auto;
  padding-inline: var(--gutter);
}
```

- [ ] **Step 10: Create `app/assets/scss/_kr.scss`**

```scss
// Global port of the design system's components/bundle.css.
// The kr- classes are the system's public API, so they stay global, like in the bundle.
@use 'mixins' as *;

// Inline links in running text: always underlined (lamp is under 3:1 against ink).
.kr-link {
  color: var(--link);
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
  border-radius: 2px;
  transition: text-decoration-thickness 180ms var(--ease);

  &:hover {
    text-decoration-thickness: 2px;
  }

  &:focus-visible {
    @include focus-ring;
  }
}

// Button. min-height instead of height so long German labels can wrap on narrow phones.
.kr-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  min-height: 40px;
  padding: var(--space-2) var(--space-4);
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--ink);
  font-family: var(--font-sans);
  font-size: 15px;
  font-weight: 500;
  line-height: 1.2;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  transition:
    background-color 180ms var(--ease),
    border-color 180ms var(--ease),
    color 180ms var(--ease);

  &:focus-visible {
    @include focus-ring;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.kr-btn--primary {
  background: var(--lamp);
  color: var(--on-lamp);

  &:hover:not(:disabled) {
    background: var(--lamp-hover);
  }
}

.kr-btn--secondary {
  border-color: var(--line-control);

  &:hover:not(:disabled) {
    background: var(--surface-raised);
  }
}

.kr-btn--ghost {
  color: var(--ink-muted);

  &:hover:not(:disabled) {
    background: var(--surface);
    color: var(--ink);
  }
}

.kr-btn--sm {
  min-height: 32px;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-sm);
  font-size: 14px;

  // The brand book: the small button needs a bigger target on touch screens.
  @media (pointer: coarse) {
    min-height: 40px;
  }
}

// Tag
.kr-tag {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 var(--space-2);
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  color: var(--ink-muted);
  font-family: var(--font-mono);
  font-size: 12px;
  line-height: 16px;
  font-weight: 500;
  letter-spacing: 0.02em;
  white-space: nowrap;
}

.kr-tag--lamp {
  background: var(--lamp-soft);
  border-color: var(--lamp-soft);
  color: var(--lamp);
}

// Section heading
.kr-eyebrow {
  margin: 0 0 var(--space-3);
  color: var(--ink-faint);
  @include type-label;
}

.kr-section-heading__title {
  margin: 0;
  color: var(--ink);
  @include type-heading;

  em {
    font-style: italic;
  }
}

.kr-section-heading--page .kr-section-heading__title {
  @include type-title;
}

.kr-section-heading__lead {
  margin: var(--space-3) 0 0;
  max-width: var(--width-prose);
  color: var(--ink-muted);
  @include type-lead;
}

// Project card
.kr-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  color: inherit;
  text-decoration: none;
  transition:
    background-color 180ms var(--ease),
    box-shadow 240ms var(--ease),
    transform 240ms var(--ease);
}

.kr-card--link:hover {
  background: var(--surface-raised);
  box-shadow: var(--shadow-lift);
  transform: translateY(-2px);
}

.kr-card--link:focus-visible {
  @include focus-ring;
}

.kr-card__media {
  aspect-ratio: 16 / 10;
  background: var(--surface-raised);
  border-bottom: 1px solid var(--line);

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.kr-card__body {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-6);
}

.kr-card__meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-3);
  color: var(--ink-faint);
  @include type-label;
}

.kr-card__arrow {
  font-family: var(--font-sans);
  font-size: 16px;
  transition:
    transform 180ms var(--ease),
    color 180ms var(--ease);
}

.kr-card--link:hover .kr-card__arrow {
  color: var(--lamp);
  transform: translateX(2px);
}

.kr-card__title {
  margin: 0;
  color: var(--ink);
  @include type-subheading;
}

.kr-card__summary {
  margin: 0;
  color: var(--ink-muted);
  @include type-small;
}

.kr-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin: var(--space-1) 0 0;
  padding: 0;
  list-style: none;
}

// Timeline item
.kr-timeline-item {
  display: grid;
  grid-template-columns: 160px minmax(0, 1fr);
  gap: var(--space-6);
  padding: var(--space-6) 0;
  border-top: 1px solid var(--line);

  @include phone {
    grid-template-columns: minmax(0, 1fr);
    gap: var(--space-2);
  }
}

.kr-timeline-item__period {
  margin: 0;
  padding-top: 6px;
  color: var(--ink-faint);
  @include type-label;

  @include phone {
    padding-top: 0;
  }
}

.kr-timeline-item__title {
  margin: 0;
  color: var(--ink);
  @include type-subheading;
}

.kr-timeline-item__place {
  margin: 2px 0 0;
  color: var(--ink-muted);
  @include type-small;
}

.kr-timeline-item__text {
  margin-top: var(--space-3);
  max-width: var(--width-prose);
  color: var(--ink);
  @include type-body;

  p {
    margin: 0 0 var(--space-3);

    &:last-child {
      margin-bottom: 0;
    }
  }
}

// Site header
.kr-header {
  display: flex;
  align-items: center;
  gap: var(--space-8);
  height: var(--header-height);

  @include phone {
    gap: var(--space-4);
  }
}

.kr-header__name {
  color: var(--ink);
  font-family: var(--font-serif);
  font-size: 20px;
  line-height: 28px;
  font-weight: 500;
  letter-spacing: -0.01em;
  text-decoration: none;
  white-space: nowrap;
  border-radius: 2px;

  &:focus-visible {
    @include focus-ring;
  }
}

.kr-header__nav {
  ul {
    display: flex;
    gap: var(--space-6);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  a {
    position: relative;
    display: inline-block;
    padding: var(--space-2) 0;
    color: var(--ink-muted);
    font-size: 15px;
    line-height: 20px;
    text-decoration: none;
    border-radius: 2px;
    transition: color 180ms var(--ease);

    &:hover,
    &[aria-current='page'] {
      color: var(--ink);
    }

    &[aria-current='page']::after {
      content: '';
      position: absolute;
      left: 50%;
      bottom: -2px;
      width: 4px;
      height: 4px;
      margin-left: -2px;
      border-radius: var(--radius-full);
      background: var(--lamp);
    }

    &:focus-visible {
      @include focus-ring;
    }
  }

  @include phone {
    display: none;
  }
}

.kr-header__end {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-left: auto;

  @include phone {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .kr-btn,
  .kr-card,
  .kr-card__arrow,
  .kr-link,
  .kr-header__nav a {
    transition: none;
  }

  .kr-card--link:hover,
  .kr-card--link:hover .kr-card__arrow {
    transform: none;
  }
}
```

- [ ] **Step 11: Create `app/assets/scss/_layout.scss`**

```scss
// Page-level layout shared by all pages.
@use 'mixins' as *;

.page-frame {
  @include page-frame;
}

.page {
  padding-top: var(--space-24);

  @include phone {
    padding-top: var(--space-12);
  }
}

// A section: heading, then content 32px below, then the section gap.
.block {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
  padding-bottom: var(--section-gap);
}

.block__head {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-end;
  gap: var(--space-4);
}

.block__more {
  flex: none;
  font-size: 15px;
  line-height: 20px;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}

// Three columns on desktop, two on tablets, one on phones; min() keeps 320px phones from overflowing.
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr));
  gap: var(--space-6);
}

.timeline {
  border-bottom: 1px solid var(--line);
}

.prose {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  max-width: var(--width-prose);
  color: var(--ink);
  @include type-body;
}
```

- [ ] **Step 12: Create `app/assets/scss/main.scss`**

```scss
@use 'tokens';
@use 'fonts';
@use 'kr';
@use 'layout';
@use 'mixins' as *;

*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
}

body {
  margin: 0;
  min-width: 320px;
  background: var(--bg);
  color: var(--ink);
  @include type-body;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  transition:
    background-color 180ms var(--ease),
    color 180ms var(--ease);
}

h1,
h2,
h3,
h4,
p,
ul,
ol,
dl,
dd,
figure {
  margin: 0;
}

ul,
ol {
  padding: 0;
  list-style: none;
}

img {
  display: block;
  max-width: 100%;
  height: auto;
}

a {
  color: inherit;
}

button {
  font: inherit;
}

// Long German compounds must wrap on 320px phones instead of overflowing.
h1,
h2,
h3,
p,
li,
dt,
dd {
  overflow-wrap: break-word;
}

h1,
h2,
h3 {
  hyphens: auto;
}

::selection {
  background: var(--lamp-soft);
  color: var(--ink);
}

.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-height: 100dvh;

  > main {
    flex: 1;
  }
}

main:focus {
  outline: none;
}

.skip-link {
  position: absolute;
  top: -100px;
  left: var(--space-4);
  z-index: 100;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  background: var(--surface-raised);
  color: var(--ink);
  text-decoration: none;
  @include type-small;

  &:focus {
    top: var(--space-4);
    @include focus-ring;
  }
}

.visually-hidden {
  position: absolute !important;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}

// The brand book: content fades in once on load, 8px rise, 320ms, 60ms stagger (set --i per section).
@keyframes kr-rise {
  from {
    opacity: 0;
    transform: translateY(8px);
  }

  to {
    opacity: 1;
    transform: none;
  }
}

.reveal {
  animation: kr-rise 320ms var(--ease) both;
  animation-delay: calc(var(--i, 0) * 60ms);
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation: none !important;
    transition-duration: 0ms !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 13: Register the styles, fonts and head defaults in `nuxt.config.ts`**

Replace the whole file with:

```ts
import { LANGUAGE_COOKIE } from './app/utils/preferences'
import { themeInitScript } from './app/utils/theme'

export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/i18n'],
  css: ['~/assets/scss/main.scss'],
  app: {
    head: {
      titleTemplate: 'Patrick Kraft · %s',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'color-scheme', content: 'dark light' },
      ],
      link: [
        { rel: 'icon', href: '/favicon.ico' },
        { rel: 'preload', href: '/fonts/Newsreader-Variable.woff2', as: 'font', type: 'font/woff2', crossorigin: '' },
        { rel: 'preload', href: '/fonts/Geist-Variable.woff2', as: 'font', type: 'font/woff2', crossorigin: '' },
      ],
      script: [{ innerHTML: themeInitScript, tagPriority: 'critical' }],
    },
  },
  i18n: {
    baseUrl: 'https://kraftpatrick.dev',
    defaultLocale: 'de',
    strategy: 'prefix_except_default',
    locales: [
      { code: 'de', language: 'de-DE', name: 'Deutsch', file: 'de.json' },
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
    ],
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: LANGUAGE_COOKIE,
      redirectOn: 'root',
      fallbackLocale: 'de',
    },
  },
})
```

- [ ] **Step 14: Check the styles compile into the build**

```bash
npm run generate
grep -l "e59572" .output/public/_nuxt/*.css
```

Expected: generate succeeds (no Sass error), and `grep -l` prints one CSS file.

- [ ] **Step 15: Run all tests**

Run: `npm test`
Expected: PASS.

- [ ] **Step 16: Commit**

```bash
git add public scripts app/assets tests/assets.test.ts nuxt.config.ts
git commit -m "feat: add design tokens, self-hosted fonts, global kr styles and images"
```

---

### Task 5: Design-system components

**Files:**
- Create: `app/components/kr/Button.vue`, `Tag.vue`, `SectionHeading.vue`, `ProjectCard.vue`, `TimelineItem.vue`
- Test: `tests/components.test.ts`

**Interfaces:**
- Consumes: the global `kr-*` classes (Task 4).
- Produces (auto-imported in Nuxt as `Kr*`):
  - `<KrButton variant? size? href? to? external? type?>`: `variant: 'primary' | 'secondary' | 'ghost'` (default `secondary`), `size: 'md' | 'sm'`, `to: string` (a path on this site) renders `NuxtLink`, `href` renders `<a>`, otherwise `<button type="button">`. Fallthrough attrs (`@click`, `aria-label`, `lang`) land on the root.
  - `<KrTag tone?>`: `tone: 'neutral' | 'lamp'`.
  - `<KrSectionHeading eyebrow? title? lead? as?>`: `as: 'h1' | 'h2' | 'h3'` (default `h2`; `h1` adds `kr-section-heading--page`); slots `title` and `default` (lead).
  - `<KrProjectCard title meta? summary? tags? href? external? image? imageAlt? as?>`: `as` defaults to `h3`; an `<a>` when `href` is set, otherwise an `<article>`.
  - `<KrTimelineItem period title place? text? as?>`: `as` defaults to `h3`; a default slot replaces `text`.

- [ ] **Step 1: Write the failing test `tests/components.test.ts`**

```ts
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import KrButton from '../app/components/kr/Button.vue'
import KrProjectCard from '../app/components/kr/ProjectCard.vue'
import KrSectionHeading from '../app/components/kr/SectionHeading.vue'
import KrTag from '../app/components/kr/Tag.vue'
import KrTimelineItem from '../app/components/kr/TimelineItem.vue'

// Stands in for Nuxt's <NuxtLink>, which only exists inside a Nuxt app.
const NuxtLink = defineComponent({
  props: { to: { type: [String, Object], required: true } },
  setup(props, { slots }) {
    return () => h('a', { href: String(props.to), 'data-test': 'nuxt-link' }, slots.default?.())
  },
})
const global = { components: { NuxtLink } }

describe('KrButton', () => {
  it('is a secondary <button type="button"> by default', () => {
    const wrapper = mount(KrButton, { slots: { default: 'Save' }, global })
    expect(wrapper.element.tagName).toBe('BUTTON')
    expect(wrapper.attributes('type')).toBe('button')
    expect(wrapper.classes()).toEqual(['kr-btn', 'kr-btn--secondary'])
    expect(wrapper.text()).toBe('Save')
  })

  it('renders an <a> for href and opens external links in a new tab', () => {
    const wrapper = mount(KrButton, {
      props: { href: 'https://example.com', external: true, variant: 'primary' },
      slots: { default: 'Go' },
      global,
    })
    expect(wrapper.element.tagName).toBe('A')
    expect(wrapper.attributes()).toMatchObject({ href: 'https://example.com', target: '_blank', rel: 'noopener noreferrer' })
    expect(wrapper.classes()).toContain('kr-btn--primary')
  })

  it('keeps mailto links in the same tab', () => {
    const wrapper = mount(KrButton, { props: { href: 'mailto:a@b.c' }, slots: { default: 'Mail' }, global })
    expect(wrapper.attributes('target')).toBeUndefined()
  })

  it('uses NuxtLink for routes on this site', () => {
    const wrapper = mount(KrButton, { props: { to: '/projects' }, slots: { default: 'Projects' }, global })
    expect(wrapper.attributes('data-test')).toBe('nuxt-link')
    expect(wrapper.attributes('href')).toBe('/projects')
    expect(wrapper.classes()).toContain('kr-btn')
  })

  it('adds the small modifier and passes listeners through', async () => {
    let clicks = 0
    const wrapper = mount(KrButton, { props: { size: 'sm', variant: 'ghost' }, attrs: { onClick: () => clicks++ }, global })
    expect(wrapper.classes()).toEqual(['kr-btn', 'kr-btn--ghost', 'kr-btn--sm'])
    await wrapper.trigger('click')
    expect(clicks).toBe(1)
  })
})

describe('KrTag', () => {
  it('is neutral by default and tinted with tone="lamp"', () => {
    expect(mount(KrTag, { slots: { default: 'Vue' } }).classes()).toEqual(['kr-tag'])
    expect(mount(KrTag, { props: { tone: 'lamp' } }).classes()).toEqual(['kr-tag', 'kr-tag--lamp'])
  })
})

describe('KrSectionHeading', () => {
  it('renders eyebrow, an h2 title and the lead', () => {
    const wrapper = mount(KrSectionHeading, { props: { eyebrow: '01 · work', title: 'Work', lead: 'What I built.' } })
    expect(wrapper.find('.kr-eyebrow').text()).toBe('01 · work')
    expect(wrapper.find('h2.kr-section-heading__title').text()).toBe('Work')
    expect(wrapper.find('.kr-section-heading__lead').text()).toBe('What I built.')
    expect(wrapper.classes()).not.toContain('kr-section-heading--page')
  })

  it('becomes a page title with as="h1" and leaves out empty parts', () => {
    const wrapper = mount(KrSectionHeading, { props: { as: 'h1', title: 'Projects' } })
    expect(wrapper.find('h1').text()).toBe('Projects')
    expect(wrapper.classes()).toContain('kr-section-heading--page')
    expect(wrapper.find('.kr-eyebrow').exists()).toBe(false)
    expect(wrapper.find('.kr-section-heading__lead').exists()).toBe(false)
  })

  it('takes a rich title through the title slot', () => {
    const wrapper = mount(KrSectionHeading, { slots: { title: () => ['From the cleanroom ', h('em', 'to code')] } })
    expect(wrapper.find('h2 em').text()).toBe('to code')
  })
})

describe('KrProjectCard', () => {
  const base = { title: 'LACNR', meta: 'web · 2026', summary: 'A website.', tags: ['Blazor', 'Vue 3'] }

  it('is an <article> without link or arrow when there is no href', () => {
    const wrapper = mount(KrProjectCard, { props: base })
    expect(wrapper.element.tagName).toBe('ARTICLE')
    expect(wrapper.classes()).not.toContain('kr-card--link')
    expect(wrapper.find('.kr-card__arrow').exists()).toBe(false)
  })

  it('renders title, meta, summary and tags', () => {
    const wrapper = mount(KrProjectCard, { props: base })
    expect(wrapper.find('h3.kr-card__title').text()).toBe('LACNR')
    expect(wrapper.find('.kr-card__meta').text()).toBe('web · 2026')
    expect(wrapper.find('.kr-card__summary').text()).toBe('A website.')
    expect(wrapper.findAll('.kr-tag').map((tag) => tag.text())).toEqual(['Blazor', 'Vue 3'])
  })

  it('is a whole-card link that opens other sites in a new tab with ↗', () => {
    const wrapper = mount(KrProjectCard, { props: { ...base, href: 'https://berrybit.dev', external: true } })
    expect(wrapper.element.tagName).toBe('A')
    expect(wrapper.attributes()).toMatchObject({ href: 'https://berrybit.dev', target: '_blank', rel: 'noopener noreferrer' })
    expect(wrapper.classes()).toContain('kr-card--link')
    expect(wrapper.find('.kr-card__arrow').text()).toBe('↗')
    expect(wrapper.find('.kr-card__arrow').attributes('aria-hidden')).toBe('true')
  })

  it('uses → and stays in the tab for links on this site', () => {
    const wrapper = mount(KrProjectCard, { props: { ...base, href: '/projects' } })
    expect(wrapper.find('.kr-card__arrow').text()).toBe('→')
    expect(wrapper.attributes('target')).toBeUndefined()
  })

  it('leaves out meta, summary and tags when they are missing', () => {
    const wrapper = mount(KrProjectCard, { props: { title: 'Solo' } })
    expect(wrapper.find('.kr-card__meta').exists()).toBe(false)
    expect(wrapper.find('.kr-card__summary').exists()).toBe(false)
    expect(wrapper.find('.kr-card__tags').exists()).toBe(false)
  })
})

describe('KrTimelineItem', () => {
  it('renders period, title, place and text', () => {
    const wrapper = mount(KrTimelineItem, {
      props: { period: '2023–2025', title: 'Bulk production', place: 'CSL Behring GmbH, Marburg', text: 'Ran equipment.' },
    })
    expect(wrapper.find('.kr-timeline-item__period').text()).toBe('2023–2025')
    expect(wrapper.find('h3.kr-timeline-item__title').text()).toBe('Bulk production')
    expect(wrapper.find('.kr-timeline-item__place').text()).toBe('CSL Behring GmbH, Marburg')
    expect(wrapper.find('.kr-timeline-item__text').text()).toBe('Ran equipment.')
  })

  it('leaves out place and text when they are missing', () => {
    const wrapper = mount(KrTimelineItem, { props: { period: '2020–2023', title: 'Service staff' } })
    expect(wrapper.find('.kr-timeline-item__place').exists()).toBe(false)
    expect(wrapper.find('.kr-timeline-item__text').exists()).toBe(false)
  })
})
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npm test -- tests/components.test.ts`
Expected: FAIL, cannot resolve `../app/components/kr/Button.vue`.

- [ ] **Step 3: Create `app/components/kr/Button.vue`**

```vue
<script setup lang="ts">
import { computed, resolveComponent } from 'vue'

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost'
    size?: 'md' | 'sm'
    href?: string
    /** A path on this site, e.g. from localePath(); rendered with NuxtLink. */
    to?: string
    external?: boolean
    type?: 'button' | 'submit'
  }>(),
  { variant: 'secondary', size: 'md', type: 'button' },
)

const NuxtLink = resolveComponent('NuxtLink')
const classes = computed(() => ['kr-btn', `kr-btn--${props.variant}`, { 'kr-btn--sm': props.size === 'sm' }])
const newTab = computed(() => (props.external ? { target: '_blank', rel: 'noopener noreferrer' } : {}))
</script>

<template>
  <component :is="NuxtLink" v-if="to" :to="to" :class="classes"><slot /></component>
  <a v-else-if="href" :href="href" :class="classes" v-bind="newTab"><slot /></a>
  <button v-else :type="type" :class="classes"><slot /></button>
</template>
```

- [ ] **Step 4: Create `app/components/kr/Tag.vue`**

```vue
<script setup lang="ts">
withDefaults(defineProps<{ tone?: 'neutral' | 'lamp' }>(), { tone: 'neutral' })
</script>

<template>
  <span class="kr-tag" :class="{ 'kr-tag--lamp': tone === 'lamp' }"><slot /></span>
</template>
```

- [ ] **Step 5: Create `app/components/kr/SectionHeading.vue`**

```vue
<script setup lang="ts">
withDefaults(
  defineProps<{
    eyebrow?: string
    title?: string
    lead?: string
    as?: 'h1' | 'h2' | 'h3'
  }>(),
  { as: 'h2' },
)
</script>

<template>
  <div class="kr-section-heading" :class="{ 'kr-section-heading--page': as === 'h1' }">
    <p v-if="eyebrow" class="kr-eyebrow">{{ eyebrow }}</p>
    <component :is="as" class="kr-section-heading__title">
      <slot name="title">{{ title }}</slot>
    </component>
    <p v-if="lead || $slots.default" class="kr-section-heading__lead">
      <slot>{{ lead }}</slot>
    </p>
  </div>
</template>
```

- [ ] **Step 6: Create `app/components/kr/ProjectCard.vue`**

```vue
<script setup lang="ts">
import { computed } from 'vue'
import KrTag from './Tag.vue'

const props = withDefaults(
  defineProps<{
    title: string
    meta?: string
    summary?: string
    tags?: string[]
    href?: string
    external?: boolean
    image?: string
    imageAlt?: string
    as?: 'h2' | 'h3' | 'h4'
  }>(),
  { tags: () => [], imageAlt: '', as: 'h3' },
)

const arrow = computed(() => (props.href ? (props.external ? '↗' : '→') : null))
const root = computed(() => (props.href ? 'a' : 'article'))
const linkAttrs = computed(() => {
  if (!props.href) return {}
  return props.external ? { href: props.href, target: '_blank', rel: 'noopener noreferrer' } : { href: props.href }
})
</script>

<template>
  <component :is="root" class="kr-card" :class="{ 'kr-card--link': !!href }" v-bind="linkAttrs">
    <div v-if="image" class="kr-card__media">
      <img :src="image" :alt="imageAlt" loading="lazy">
    </div>
    <div class="kr-card__body">
      <div v-if="meta || arrow" class="kr-card__meta">
        <span>{{ meta }}</span>
        <span v-if="arrow" class="kr-card__arrow" aria-hidden="true">{{ arrow }}</span>
      </div>
      <component :is="as" class="kr-card__title">{{ title }}</component>
      <p v-if="summary" class="kr-card__summary">{{ summary }}</p>
      <ul v-if="tags.length" class="kr-card__tags">
        <li v-for="tag in tags" :key="tag"><KrTag>{{ tag }}</KrTag></li>
      </ul>
    </div>
  </component>
</template>
```

- [ ] **Step 7: Create `app/components/kr/TimelineItem.vue`**

```vue
<script setup lang="ts">
withDefaults(
  defineProps<{
    period: string
    title: string
    place?: string
    text?: string
    as?: 'h3' | 'h4'
  }>(),
  { as: 'h3' },
)
</script>

<template>
  <div class="kr-timeline-item">
    <p class="kr-timeline-item__period">{{ period }}</p>
    <div class="kr-timeline-item__main">
      <component :is="as" class="kr-timeline-item__title">{{ title }}</component>
      <p v-if="place" class="kr-timeline-item__place">{{ place }}</p>
      <div v-if="text || $slots.default" class="kr-timeline-item__text">
        <slot><p>{{ text }}</p></slot>
      </div>
    </div>
  </div>
</template>
```

- [ ] **Step 8: Run the tests and watch them pass**

Run: `npm test`
Expected: PASS, including 16 tests in `tests/components.test.ts`.

- [ ] **Step 9: Commit**

```bash
git add app/components/kr tests/components.test.ts
git commit -m "feat: add design-system components as Vue SFCs"
```

---

### Task 6: Site chrome (header, menu, switches, footer, error page)

**Files:**
- Create:
  - Composables: `app/composables/useLocalized.ts`, `useNavLinks.ts`, `usePageMeta.ts`.
  - Components: `app/components/SiteHeader.vue`, `LangSwitch.vue`, `ThemeToggle.vue`, `MobileMenu.vue`, `SiteFooter.vue`.
  - `app/error.vue`.
  - `.claude/launch.json`: local only, not committed (`.claude/` stays untracked).
- Modify: `app/app.vue`

**Interfaces:**
- Consumes: `useTheme` (Task 3), `KrButton` (Task 5), `profile` (Task 2), locale keys `nav.*`, `theme.*`, `menu.*`, `skip`, `footer.*`, `meta.*`, `error.*` (Task 1).
- Produces:
  - `useLocalized(): { locale: ComputedRef<Locale>; l<T>(value: Localized<T>): T }`
  - `useNavLinks(): { links: ComputedRef<NavLink[]> }` with `NavLink { key: 'projects' | 'about' | 'contact'; label: string; to: RouteLocationRaw; current: boolean }`
  - `usePageMeta(key: PageMetaKey): void` with `PageMetaKey = 'home' | 'projects' | 'about' | 'impressum' | 'datenschutz' | 'notFound'`
  - App shell: `<main id="main">` wraps every page. Pages render only their content, no `<main>`.

- [ ] **Step 1: Create `app/composables/useLocalized.ts`**

```ts
import type { Locale, Localized } from '~/data/types'

/** Picks the current language's value from a Localized<T> in data files. */
export function useLocalized() {
  const { locale } = useI18n()
  const current = computed(() => locale.value as Locale)
  const l = <T>(value: Localized<T>): T => value[current.value]
  return { locale: current, l }
}
```

- [ ] **Step 2: Create `app/composables/useNavLinks.ts`**

```ts
import type { RouteLocationRaw } from 'vue-router'

export interface NavLink {
  key: 'projects' | 'about' | 'contact'
  label: string
  to: RouteLocationRaw
  current: boolean
}

/** One source for the header nav and the mobile menu. Contact is a section on Home, never "current". */
export function useNavLinks() {
  const { t } = useI18n()
  const localePath = useLocalePath()
  const route = useRoute()

  const links = computed<NavLink[]>(() => {
    const here = route.path.replace(/\/+$/, '') || '/'
    const projects = localePath('/projects')
    const about = localePath('/about')
    return [
      { key: 'projects', label: t('nav.projects'), to: projects, current: here === projects },
      { key: 'about', label: t('nav.about'), to: about, current: here === about },
      { key: 'contact', label: t('nav.contact'), to: { path: localePath('/'), hash: '#contact' }, current: false },
    ]
  })

  return { links }
}
```

- [ ] **Step 3: Create `app/composables/usePageMeta.ts`**

```ts
export type PageMetaKey = 'home' | 'projects' | 'about' | 'impressum' | 'datenschutz' | 'notFound'

/** Title (via the "Patrick Kraft · %s" template), description and Open Graph text per page and language. */
export function usePageMeta(key: PageMetaKey) {
  const { t } = useI18n()
  const title = () => t(`meta.${key}.title`)
  const description = () => t(`meta.${key}.description`)

  useSeoMeta({
    title,
    description,
    ogTitle: () => `Patrick Kraft · ${title()}`,
    ogDescription: description,
    twitterTitle: () => `Patrick Kraft · ${title()}`,
    twitterDescription: description,
  })
}
```

- [ ] **Step 4: Create `app/components/ThemeToggle.vue`**

```vue
<script setup lang="ts">
const { t } = useI18n()
const { theme, toggle, syncFromDocument } = useTheme()

onMounted(syncFromDocument)

const label = computed(() => (theme.value === 'night' ? t('theme.toDay') : t('theme.toNight')))
const aria = computed(() => (theme.value === 'night' ? t('theme.ariaToDay') : t('theme.ariaToNight')))
</script>

<template>
  <KrButton variant="ghost" size="sm" :aria-label="aria" @click="toggle">{{ label }}</KrButton>
</template>
```

- [ ] **Step 5: Create `app/components/LangSwitch.vue`**

```vue
<script setup lang="ts">
const NAMES = { de: 'Deutsch', en: 'English' } as const

const { locale } = useI18n()
const switchLocalePath = useSwitchLocalePath()
const target = computed(() => (locale.value === 'de' ? 'en' : 'de'))
</script>

<template>
  <KrButton variant="ghost" size="sm" :to="switchLocalePath(target)" :lang="target" :hreflang="target">
    {{ NAMES[target] }}
  </KrButton>
</template>
```

- [ ] **Step 6: Create `app/components/MobileMenu.vue`**

```vue
<script setup lang="ts">
const { t } = useI18n()
const { links } = useNavLinks()
const route = useRoute()

const open = ref(false)
const trigger = ref<HTMLButtonElement | null>(null)
const panel = ref<HTMLElement | null>(null)

function lockScroll(locked: boolean) {
  document.documentElement.style.overflow = locked ? 'hidden' : ''
}

async function show() {
  open.value = true
  lockScroll(true)
  await nextTick()
  panel.value?.querySelector<HTMLElement>('a, button')?.focus()
}

function hide(returnFocus = true) {
  if (!open.value) return
  open.value = false
  lockScroll(false)
  if (returnFocus) trigger.value?.focus()
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') hide()
}

// Navigating (a link, the language switch) closes the menu without stealing focus.
watch(() => route.fullPath, () => hide(false))

let desktop: MediaQueryList | null = null
const onDesktopChange = (event: MediaQueryListEvent) => {
  if (event.matches) hide(false)
}

onMounted(() => {
  desktop = window.matchMedia('(min-width: 640px)')
  desktop.addEventListener('change', onDesktopChange)
})

onBeforeUnmount(() => {
  desktop?.removeEventListener('change', onDesktopChange)
  lockScroll(false)
})
</script>

<template>
  <div class="mobile-menu" @keydown="onKeydown">
    <button
      ref="trigger"
      type="button"
      class="kr-btn kr-btn--ghost kr-btn--sm"
      aria-controls="mobile-menu-panel"
      :aria-expanded="open ? 'true' : 'false'"
      @click="open ? hide() : show()"
    >
      {{ open ? t('menu.close') : t('menu.open') }}
    </button>
    <div v-show="open" id="mobile-menu-panel" ref="panel" class="mobile-menu__panel">
      <nav :aria-label="t('nav.label')">
        <ul class="mobile-menu__links">
          <li v-for="link in links" :key="link.key">
            <NuxtLink v-slot="{ href, navigate }" :to="link.to" custom>
              <a :href="href" class="mobile-menu__link" :aria-current="link.current ? 'page' : undefined" @click="navigate">
                {{ link.label }}
              </a>
            </NuxtLink>
          </li>
        </ul>
      </nav>
      <div class="mobile-menu__switches">
        <LangSwitch />
        <ThemeToggle />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '~/assets/scss/mixins' as *;

.mobile-menu {
  display: none;
  margin-left: auto;

  @include phone {
    display: block;
  }
}

.mobile-menu__panel {
  position: fixed;
  inset: calc(var(--header-height) + 1px) 0 0 0;
  z-index: 50;
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
  overflow-y: auto;
  padding: var(--space-6) var(--gutter);
  background: var(--surface-raised);
}

.mobile-menu__link {
  display: flex;
  align-items: center;
  min-height: 48px;
  border-bottom: 1px solid var(--line);
  color: var(--ink);
  text-decoration: none;
  @include type-subheading;

  &[aria-current='page'] {
    color: var(--lamp);
  }

  &:focus-visible {
    @include focus-ring;
  }
}

.mobile-menu__switches {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}
</style>
```

- [ ] **Step 7: Create `app/components/SiteHeader.vue`**

```vue
<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const { links } = useNavLinks()
</script>

<template>
  <div class="site-header">
    <header class="kr-header page-frame">
      <NuxtLink class="kr-header__name" :to="localePath('/')">Patrick Kraft</NuxtLink>
      <nav class="kr-header__nav" :aria-label="t('nav.label')">
        <ul>
          <li v-for="link in links" :key="link.key">
            <NuxtLink v-slot="{ href, navigate }" :to="link.to" custom>
              <a :href="href" :aria-current="link.current ? 'page' : undefined" @click="navigate">{{ link.label }}</a>
            </NuxtLink>
          </li>
        </ul>
      </nav>
      <div class="kr-header__end">
        <LangSwitch />
        <ThemeToggle />
      </div>
      <MobileMenu />
    </header>
  </div>
</template>

<style scoped lang="scss">
.site-header {
  border-bottom: 1px solid var(--line);
  background: var(--bg);
}
</style>
```

- [ ] **Step 8: Create `app/components/SiteFooter.vue`**

```vue
<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
// Rendered at build time; useState carries the same year to the client to avoid a hydration mismatch.
const year = useState('footer-year', () => new Date().getFullYear())
</script>

<template>
  <footer class="site-footer">
    <div class="site-footer__inner page-frame">
      <p>{{ t('footer.copyright', { year }) }} · {{ t('footer.built') }}</p>
      <ul class="site-footer__links">
        <li><NuxtLink class="site-footer__link" :to="localePath('/impressum')">{{ t('footer.legal') }}</NuxtLink></li>
        <li><NuxtLink class="site-footer__link" :to="localePath('/datenschutz')">{{ t('footer.privacy') }}</NuxtLink></li>
      </ul>
    </div>
  </footer>
</template>

<style scoped lang="scss">
@use '~/assets/scss/mixins' as *;

.site-footer {
  border-top: 1px solid var(--line);
}

.site-footer__inner {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: var(--space-4);
  padding-block: var(--space-8) var(--space-12);
  color: var(--ink-faint);
  @include type-small;
}

.site-footer__links {
  display: flex;
  gap: var(--space-4);
}

.site-footer__link {
  color: var(--ink-muted);
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
  text-decoration-color: var(--line-control);
  border-radius: 2px;

  &:hover {
    color: var(--ink);
    text-decoration-color: var(--ink);
  }

  &:focus-visible {
    @include focus-ring;
  }
}
</style>
```

- [ ] **Step 9: Replace `app/app.vue`**

```vue
<script setup lang="ts">
import { profile } from '~/data/profile'

const { t } = useI18n()
const i18nHead = useLocaleHead({ seo: true })

useHead(() => ({
  htmlAttrs: { lang: i18nHead.value.htmlAttrs.lang },
  link: [...(i18nHead.value.link ?? [])],
  meta: [...(i18nHead.value.meta ?? [])],
}))

useSeoMeta({
  ogSiteName: 'Patrick Kraft',
  ogType: 'website',
  ogImage: `${profile.siteUrl}/images/og.jpg`,
  ogImageWidth: 1200,
  ogImageHeight: 630,
  twitterCard: 'summary_large_image',
})
</script>

<template>
  <div class="app">
    <a class="skip-link" href="#main">{{ t('skip') }}</a>
    <SiteHeader />
    <main id="main" tabindex="-1">
      <NuxtPage />
    </main>
    <SiteFooter />
  </div>
</template>
```

- [ ] **Step 10: Create `app/error.vue`**

```vue
<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()
const { t } = useI18n()
const localePath = useLocalePath()
const i18nHead = useLocaleHead({ seo: false })

useHead(() => ({ htmlAttrs: { lang: i18nHead.value.htmlAttrs.lang } }))
usePageMeta('notFound')

const isNotFound = computed(() => props.error.statusCode === 404)

function goHome() {
  clearError({ redirect: localePath('/') })
}
</script>

<template>
  <div class="app">
    <a class="skip-link" href="#main">{{ t('skip') }}</a>
    <SiteHeader />
    <main id="main" tabindex="-1">
      <div class="page page-frame">
        <section class="block">
          <KrSectionHeading
            as="h1"
            :eyebrow="String(error.statusCode)"
            :title="isNotFound ? t('error.title') : t('error.titleGeneric')"
            :lead="t('error.text')"
          />
          <div class="actions">
            <KrButton variant="primary" @click="goHome">{{ t('error.home') }}</KrButton>
          </div>
        </section>
      </div>
    </main>
    <SiteFooter />
  </div>
</template>
```

- [ ] **Step 11: Add a dev-server preview config**

Create `.claude/launch.json` (local only; `.claude/` stays untracked):

```json
{
  "version": "0.0.1",
  "configurations": [
    { "name": "portfolio-dev", "runtimeExecutable": "npm", "runtimeArgs": ["run", "dev"], "port": 3000 },
    { "name": "portfolio-static", "runtimeExecutable": "python", "runtimeArgs": ["-m", "http.server", "4173", "--directory", ".output/public"], "port": 4173 }
  ]
}
```

If the preview tool can't start `npm` on Windows, change `"npm"` to `"npm.cmd"`.

- [ ] **Step 12: Run tests and generate**

```bash
npm test
npm run generate
```

Expected: tests PASS; generate succeeds.

- [ ] **Step 13: Verify the chrome in the browser**

Start the `portfolio-dev` preview and open `http://localhost:3000/`.

1. **Desktop (1440px):**
   - The header shows the wordmark "Patrick Kraft", the links Projekte / Über mich / Kontakt, and the buttons "English" and "Tag".
   - The footer shows "© 2026 Patrick Kraft · Gebaut mit Nuxt, Vue und SCSS." plus the Impressum and Datenschutz links.
   - `<html lang="de-DE">`.
2. **Theme:**
   - Click "Tag": the background turns `#f5f1ea` and the button reads "Nacht".
   - Reload: Day is still on, with no dark flash while loading, and `localStorage.theme === 'day'`.
   - Click "Nacht" to switch back.
3. **Language:**
   - Click "English": the URL is `/en`, the nav reads Projects / About / Contact, the button reads "Deutsch", and `<html lang="en-US">`.
   - Click "Deutsch": back to `/`.
4. **Error page (Review Focus 1):**
   - Open `/en/does-not-exist`: the English error page shows "404" and "This page doesn't exist", inside the header and footer.
   - Click "Deutsch" there: you land on the German error page or the German address of the same path, not on Home.
   - Click "Go to the home page": you land on `/en`.
5. **Phone (375×812):**
   - The nav and the switches are hidden; "Menü" is shown.
   - Click "Menü": the panel opens with three links plus "English" and "Tag", focus is on the first link, and the page behind doesn't scroll.
   - Press Esc: the panel closes and focus returns to "Menü".
6. **Skip link:** reload, press Tab once; "Zum Inhalt springen" appears top-left with the focus ring.

The "Projekte" and "Über mich" links 404 until Task 8. That's expected here.

- [ ] **Step 14: Commit**

```bash
git add app/composables app/components/SiteHeader.vue app/components/LangSwitch.vue app/components/ThemeToggle.vue app/components/MobileMenu.vue app/components/SiteFooter.vue app/app.vue app/error.vue
git commit -m "feat: add header, mobile menu, language and theme switches, footer and error page"
```

---

### Task 7: Home page

**Files:**
- Create: `app/components/FactList.vue`, `app/components/StackList.vue`
- Modify: `app/pages/index.vue` (replace placeholder)

**Interfaces:**
- Consumes: `profile`, `mailto`, `cvMailto` (Task 2); `projects`, `timeline`, `stack`, `facts` (Task 2); `useLocalized`, `usePageMeta` (Task 6); `Kr*` (Task 5); global layout classes (Task 4).
- Produces:
  - `<FactList :items="{ label: string; value: string; href?: string }[]" layout="row" | "stack">`
  - `<StackList :groups="{ label: string; items: string[] }[]">`

- [ ] **Step 1: Create `app/components/FactList.vue`**

```vue
<script setup lang="ts">
withDefaults(
  defineProps<{
    items: { label: string; value: string; href?: string }[]
    layout?: 'row' | 'stack'
  }>(),
  { layout: 'row' },
)
</script>

<template>
  <dl class="fact-list" :class="`fact-list--${layout}`">
    <div v-for="item in items" :key="item.label" class="fact-list__item">
      <dt class="fact-list__label">{{ item.label }}</dt>
      <dd class="fact-list__value">
        <a v-if="item.href" class="kr-link" :href="item.href">{{ item.value }}</a>
        <template v-else>{{ item.value }}</template>
      </dd>
    </div>
  </dl>
</template>

<style scoped lang="scss">
@use '~/assets/scss/mixins' as *;

.fact-list__item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.fact-list__label {
  color: var(--ink-faint);
  @include type-label;
}

.fact-list--row {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 190px), 1fr));
  column-gap: var(--space-8);
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);

  .fact-list__item {
    padding: 20px 0;
  }

  .fact-list__value {
    color: var(--ink);
    font-size: 15px;
    line-height: 22px;
  }
}

.fact-list--stack {
  display: flex;
  flex-direction: column;
  gap: 20px;

  .fact-list__value {
    color: var(--ink-muted);
    @include type-small;
  }
}
</style>
```

- [ ] **Step 2: Create `app/components/StackList.vue`**

```vue
<script setup lang="ts">
defineProps<{ groups: { label: string; items: string[] }[] }>()
</script>

<template>
  <dl class="stack-list">
    <div v-for="group in groups" :key="group.label" class="stack-list__row">
      <dt class="stack-list__label">{{ group.label }}</dt>
      <dd class="stack-list__items">
        <ul>
          <li v-for="item in group.items" :key="item"><KrTag>{{ item }}</KrTag></li>
        </ul>
      </dd>
    </div>
  </dl>
</template>

<style scoped lang="scss">
@use '~/assets/scss/mixins' as *;

.stack-list {
  border-top: 1px solid var(--line);
}

.stack-list__row {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: var(--space-3) var(--space-6);
  padding: 20px 0;
  border-bottom: 1px solid var(--line);
}

.stack-list__label {
  flex: 0 0 200px;
  color: var(--ink-faint);
  @include type-label;
}

.stack-list__items {
  flex: 1 1 320px;
  min-width: 0;

  ul {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }
}
</style>
```

- [ ] **Step 3: Replace `app/pages/index.vue`**

```vue
<script setup lang="ts">
import { facts } from '~/data/facts'
import { cvMailto, mailto, profile } from '~/data/profile'
import { projects } from '~/data/projects'
import { stack } from '~/data/stack'
import { timeline } from '~/data/timeline'

const { t } = useI18n()
const { l, locale } = useLocalized()
const localePath = useLocalePath()

usePageMeta('home')

const featured = computed(() => projects.filter((p) => p.featured))
const factItems = computed(() => facts.map((f) => ({ label: l(f.label), value: l(f.value) })))
const stackGroups = computed(() => stack.map((g) => ({ label: l(g.label), items: g.items })))
const homeTimeline = computed(() => timeline.filter((e) => e.onHome))
</script>

<template>
  <div class="home page page-frame">
    <section class="hero reveal" style="--i: 0">
      <div class="hero__id">
        <img class="hero__avatar" :src="profile.avatar" alt="" width="72" height="72">
        <div>
          <p class="hero__name">{{ profile.name }}</p>
          <p class="hero__idline">{{ t('home.idLine') }}</p>
        </div>
      </div>
      <h1 class="hero__title">{{ t('home.heroA') }}<em>{{ t('home.heroEm') }}</em>{{ t('home.heroB') }}</h1>
      <p class="hero__lead">{{ t('home.lead') }}</p>
      <div class="actions">
        <KrButton variant="primary" :href="mailto()">{{ t('contact.emailCta') }}</KrButton>
        <KrButton :to="localePath('/projects')">{{ t('home.ctaProjects') }}</KrButton>
      </div>
    </section>

    <section class="glance reveal" style="--i: 1">
      <h2 class="visually-hidden">{{ t('home.factsLabel') }}</h2>
      <FactList :items="factItems" layout="row" />
    </section>

    <section class="block reveal" style="--i: 2">
      <div class="block__head">
        <KrSectionHeading :eyebrow="t('home.work.eyebrow')" :title="t('home.work.title')" :lead="t('home.work.lead')" />
        <NuxtLink class="kr-link block__more" :to="localePath('/projects')">{{ t('home.work.all') }}</NuxtLink>
      </div>
      <div class="card-grid">
        <KrProjectCard
          v-for="p in featured"
          :key="p.slug"
          :title="p.title"
          :meta="l(p.meta)"
          :summary="l(p.summary)"
          :tags="p.tags"
          :href="p.href"
          :external="!!p.href"
        />
      </div>
    </section>

    <section class="block reveal" style="--i: 3">
      <KrSectionHeading :eyebrow="t('home.stack.eyebrow')" :title="t('home.stack.title')" :lead="t('home.stack.lead')" />
      <StackList :groups="stackGroups" />
    </section>

    <section class="block reveal" style="--i: 4">
      <div class="block__head">
        <KrSectionHeading :eyebrow="t('home.background.eyebrow')" :title="t('home.background.title')" :lead="t('home.background.lead')" />
        <NuxtLink class="kr-link block__more" :to="localePath('/about')">{{ t('home.background.more') }}</NuxtLink>
      </div>
      <div class="timeline">
        <KrTimelineItem
          v-for="e in homeTimeline"
          :key="e.place"
          :period="l(e.period)"
          :title="l(e.title)"
          :place="e.place"
          :text="e.text ? l(e.text) : undefined"
        />
      </div>
    </section>

    <section id="contact" class="contact reveal" style="--i: 5">
      <KrSectionHeading :eyebrow="t('home.contact.eyebrow')" :title="t('home.contact.title')" :lead="t('home.contact.lead')" />
      <div class="actions">
        <KrButton variant="primary" :href="mailto()">{{ t('contact.emailCta') }}</KrButton>
        <KrButton :href="profile.linkedin" external>LinkedIn ↗</KrButton>
        <KrButton variant="ghost" :href="cvMailto(locale)">{{ t('contact.cvCta') }}</KrButton>
      </div>
      <p class="contact__links">
        <a class="kr-link" :href="mailto()">{{ profile.email }}</a>
        <a class="kr-link" :href="profile.github" target="_blank" rel="noopener noreferrer">GitHub ↗</a>
        <span>{{ t('contact.discord') }}</span>
      </p>
    </section>
  </div>
</template>

<style scoped lang="scss">
@use '~/assets/scss/mixins' as *;

.home {
  padding-top: 80px;

  @include phone {
    padding-top: var(--space-12);
  }
}

.hero {
  display: flex;
  flex-direction: column;
  gap: 28px;
  padding-bottom: var(--space-12);
}

.hero__id {
  display: flex;
  align-items: center;
  gap: 20px;
}

.hero__avatar {
  width: 72px;
  height: 72px;
  border: 1px solid var(--line);
  border-radius: var(--radius-full);
  background: var(--surface);
  object-fit: cover;
}

.hero__name {
  color: var(--ink);
  @include type-subheading;
}

.hero__idline {
  margin-top: var(--space-1);
  color: var(--ink-faint);
  @include type-label;
}

.hero__title {
  max-width: 15em;
  color: var(--ink);
  @include type-display;

  em {
    font-style: italic;
  }
}

.hero__lead {
  max-width: var(--width-prose);
  color: var(--ink-muted);
  @include type-lead;
}

.glance {
  margin-bottom: var(--section-gap);
}

.contact {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
  margin-bottom: var(--section-gap);
  padding: clamp(24px, 4vw, 48px);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  background: var(--surface);
  scroll-margin-top: var(--space-6);
}

.contact__links {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2) var(--space-6);
  color: var(--ink-muted);
  @include type-small;
}
</style>
```

- [ ] **Step 4: Run tests and generate**

```bash
npm test
npm run generate
grep -c "128 der 142 Commits" .output/public/index.html
grep -c "128 of 142 commits" .output/public/en/index.html
```

Expected: tests PASS, generate succeeds, both greps print `1`.

- [ ] **Step 5: Verify Home in the browser against the approved mockup**

Start `portfolio-dev`. Compare `/` and `/en` with the canvas artboard "C · Rooms: home (recruiter-first)" (https://claude.ai/artifact/Dyq61D84XzTiwtHPtFRZXs).

1. **Order:** avatar row, headline with italic "genau" / "exactly", lead, two buttons, the at-a-glance row with five facts between hairlines, 01 projects (3 cards, BerryBase with ↗), 02 stack (5 rows), 03 background (3 timeline rows), and the 04 contact card with three buttons and the email / GitHub / Discord row.
2. **Links:**
   - "Schreib mir eine E-Mail" has `href="mailto:kraftpatrick@gmx.net"`.
   - "Lebenslauf anfragen" has `href="mailto:kraftpatrick@gmx.net?subject=Anfrage%20Lebenslauf"`.
   - "Alle Projekte →" and "Ganzer Werdegang →" point to `/projects` and `/about`.
3. **Both themes:** check Night and Day; text stays readable.
4. **Contact link:** "Kontakt" in the header scrolls to the contact card.
5. **Phone widths:** at 375×812 and 320×700 (Review Focus 4), run this in the page:

   ```js
   document.documentElement.scrollWidth <= window.innerWidth
   ```

   Expected: `true` on `/` and `/en`. The headline is 44px; buttons and tag rows wrap.
6. **Reduced motion:** with `prefers-reduced-motion: reduce` emulated or set in the OS, sections appear without the rise animation.

- [ ] **Step 6: Commit**

```bash
git add app/components/FactList.vue app/components/StackList.vue app/pages/index.vue
git commit -m "feat: build the recruiter-first home page"
```

---

### Task 8: Projects and About pages

**Files:**
- Create: `app/pages/projects.vue`, `app/pages/about.vue`

**Interfaces:**
- Consumes: `projects`, `timeline`, `profile`, `cvMailto` (Task 2); `TimelineEntry` type; `useLocalized`, `usePageMeta` (Task 6); `FactList` (Task 7); `Kr*` (Task 5).
- Produces: routes `/projects`, `/en/projects`, `/about`, `/en/about`.

- [ ] **Step 1: Create `app/pages/projects.vue`**

```vue
<script setup lang="ts">
import { projects } from '~/data/projects'

const { t } = useI18n()
const { l } = useLocalized()

usePageMeta('projects')
</script>

<template>
  <div class="page page-frame">
    <section class="block">
      <KrSectionHeading
        class="reveal"
        as="h1"
        :eyebrow="t('projects.eyebrow')"
        :title="t('projects.title')"
        :lead="t('projects.lead')"
      />
      <div class="card-grid reveal" style="--i: 1">
        <KrProjectCard
          v-for="p in projects"
          :key="p.slug"
          as="h2"
          :title="p.title"
          :meta="l(p.meta)"
          :summary="l(p.summary)"
          :tags="p.tags"
          :href="p.href"
          :external="!!p.href"
        />
      </div>
    </section>
  </div>
</template>
```

- [ ] **Step 2: Create `app/pages/about.vue`**

```vue
<script setup lang="ts">
import { cvMailto, profile } from '~/data/profile'
import { timeline } from '~/data/timeline'
import type { TimelineEntry } from '~/data/types'

const { t } = useI18n()
const { l, locale } = useLocalized()
const localePath = useLocalePath()

usePageMeta('about')

const work = computed(() => timeline.filter((e) => e.kind === 'work'))
const education = computed(() => timeline.filter((e) => e.kind === 'education'))
const facts = computed(() => [
  { label: t('about.facts.based'), value: t('about.values.based') },
  { label: t('about.facts.languages'), value: t('about.values.languages') },
  { label: t('about.facts.outside'), value: t('about.values.outside') },
  { label: t('about.facts.cv'), value: t('about.values.cv'), href: cvMailto(locale.value) },
])

function entryText(entry: TimelineEntry): string | undefined {
  const text = entry.textLong ?? entry.text
  return text ? l(text) : undefined
}
</script>

<template>
  <div class="page page-frame">
    <section class="block intro reveal">
      <div class="intro__text">
        <KrSectionHeading as="h1" :eyebrow="t('about.eyebrow')" :lead="t('about.lead')">
          <template #title>{{ t('about.titleA') }}<em>{{ t('about.titleEm') }}</em></template>
        </KrSectionHeading>
        <div class="prose">
          <p>{{ t('about.p1') }}</p>
          <p>{{ t('about.p2') }}</p>
          <p>{{ t('about.p3') }}</p>
        </div>
      </div>
      <div class="intro__side">
        <img class="intro__portrait" :src="profile.portrait" :alt="t('portrait.alt')" width="720" height="720">
        <h2 class="visually-hidden">{{ t('about.factsLabel') }}</h2>
        <FactList :items="facts" layout="stack" />
      </div>
    </section>

    <section class="block reveal" style="--i: 1">
      <KrSectionHeading :eyebrow="t('about.work.eyebrow')" :title="t('about.work.title')" />
      <div class="timeline">
        <KrTimelineItem
          v-for="e in work"
          :key="e.place + e.period.de"
          :period="l(e.period)"
          :title="l(e.title)"
          :place="e.place"
          :text="entryText(e)"
        />
      </div>
    </section>

    <section class="block reveal" style="--i: 2">
      <KrSectionHeading :eyebrow="t('about.education.eyebrow')" :title="t('about.education.title')" />
      <div class="timeline">
        <KrTimelineItem
          v-for="e in education"
          :key="e.place + e.period.de"
          :period="l(e.period)"
          :title="l(e.title)"
          :place="e.place"
          :text="entryText(e)"
        />
      </div>
      <div class="actions">
        <KrButton variant="primary" :href="cvMailto(locale)">{{ t('contact.cvCta') }}</KrButton>
        <KrButton :to="localePath('/projects')">{{ t('about.ctaProjects') }}</KrButton>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.intro {
  flex-direction: row;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: var(--space-12) 80px;
}

.intro__text {
  display: flex;
  flex: 999 1 480px;
  flex-direction: column;
  gap: var(--space-6);
  min-width: 0;
  max-width: var(--width-prose);
}

.intro__side {
  display: flex;
  flex: 1 1 280px;
  flex-direction: column;
  gap: var(--space-8);
  max-width: 360px;
}

.intro__portrait {
  width: 100%;
  aspect-ratio: 1 / 1;
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  background: var(--surface);
  object-fit: cover;
}
</style>
```

- [ ] **Step 3: Run tests and generate**

```bash
npm test
npm run generate
grep -c "Nicht abgeschlossen." .output/public/about/index.html
grep -c "pH measurement systems" .output/public/en/about/index.html
grep -c "berrybit.itch.io/survive-tonight" .output/public/projects/index.html
```

Expected: tests PASS, generate succeeds, each grep prints `1`.

- [ ] **Step 4: Verify both pages in the browser**

Start `portfolio-dev`.

1. **Projects:**
   - `/projects` shows the title "Projekte", the lead and five cards in this order: LACNR, BerryBase, Undercrown, Survive Tonight, berrybit.dev.
   - The three linked cards show ↗ and open in a new tab. LACNR and Undercrown aren't links.
   - The header link "Projekte" has the lamp dot.
2. **About** (compare with the canvas artboard "C · Rooms: about"):
   - `/about` shows the title with italic "zum Code", the lead and three paragraphs, the square portrait, and the facts. "Auf Anfrage per E-Mail" is a mailto link with subject "Anfrage Lebenslauf".
   - Experience lists 4 entries; CSL Behring shows the long text with "pH-Messsystemen". Education lists 3 entries.
   - The "Über mich" header link has the lamp dot.
3. **Language switch (Review Focus 1):** on `/about` click "English" and land on `/en/about`, not `/en`; on `/en/projects` click "Deutsch" and land on `/projects`.
4. **Phone widths (Review Focus 4):** at 375×812 and 320×700 on `/projects`, `/about` and `/en/about`:
   - `document.documentElement.scrollWidth <= window.innerWidth` is `true`.
   - The portrait stacks under the text, and the timeline period moves above the title.

- [ ] **Step 5: Commit**

```bash
git add app/pages/projects.vue app/pages/about.vue
git commit -m "feat: add projects and about pages"
```

---

### Task 9: Impressum and Datenschutz

**Files:**
- Create: `app/data/legal.ts`, `app/components/LegalPage.vue`, `app/pages/impressum.vue`, `app/pages/datenschutz.vue`
- Test: `tests/legal.test.ts`

**Interfaces:**
- Consumes: `profile`, `mailto` (Task 2); `THEME_STORAGE_KEY`, `LANGUAGE_COOKIE` (Task 3); `usePageMeta` (Task 6); `KrSectionHeading` (Task 5).
- Produces:
  - `LegalSection { heading: string; paragraphs: string[]; links?: LegalLink[] }`, `LegalLink { label: string; href: string; external: boolean }`.
  - `IMPRESSUM_ADDRESS`, `SECOND_CONTACT_URL`, `LEGAL_UPDATED`, `impressum: LegalSection[]`, `datenschutz: LegalSection[]`.
  - `<LegalPage :title="string" :sections="LegalSection[]">`.

- [ ] **Step 1: Write the failing test `tests/legal.test.ts`**

```ts
import { describe, expect, it } from 'vitest'
import { datenschutz, impressum, IMPRESSUM_ADDRESS, LEGAL_UPDATED, SECOND_CONTACT_URL } from '../app/data/legal'
import { profile } from '../app/data/profile'
import { LANGUAGE_COOKIE, THEME_STORAGE_KEY } from '../app/utils/preferences'

const text = (sections: typeof impressum) =>
  sections.flatMap((s) => [s.heading, ...s.paragraphs, ...(s.links ?? []).map((l) => `${l.label} ${l.href}`)]).join('\n')

describe('Impressum', () => {
  it('names Patrick with the c/o address and email', () => {
    const all = text(impressum)
    expect(all).toContain(profile.name)
    expect(all).toContain(IMPRESSUM_ADDRESS)
    expect(all).toContain(profile.email)
  })

  it('links the second contact way at online-impressum.de in a new tab', () => {
    const links = impressum.flatMap((s) => s.links ?? [])
    expect(links).toContainEqual(expect.objectContaining({ href: SECOND_CONTACT_URL, external: true }))
    expect(links).toContainEqual(expect.objectContaining({ href: `mailto:${profile.email}`, external: false }))
  })

  it('has no supervisory-authority line that would go stale after the move', () => {
    expect(text(impressum)).not.toMatch(/Aufsichtsbehörde|Medienanstalt/)
  })
})

describe('Datenschutz', () => {
  it('names the controller with the c/o address', () => {
    expect(text(datenschutz)).toContain(IMPRESSUM_ADDRESS)
  })

  it('names exactly the cookie and storage key the code uses', () => {
    const all = text(datenschutz)
    expect(all).toContain(LANGUAGE_COOKIE)
    expect(all).toContain(`„${THEME_STORAGE_KEY}“`)
  })

  it('mentions the online-impressum.de contact form', () => {
    expect(text(datenschutz)).toContain('online-impressum.de')
  })
})

describe('legal sections', () => {
  it('all have a heading and content, and a dated stand', () => {
    for (const s of [...impressum, ...datenschutz]) {
      expect(s.heading.trim()).not.toBe('')
      expect(s.paragraphs.length + (s.links?.length ?? 0), s.heading).toBeGreaterThan(0)
    }
    expect(LEGAL_UPDATED).toMatch(/^\d{2}\.\d{2}\.\d{4}$/)
  })
})
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npm test -- tests/legal.test.ts`
Expected: FAIL, cannot resolve `../app/data/legal`.

- [ ] **Step 3: Create `app/data/legal.ts`**

```ts
import { mailto, profile } from './profile'
import { LANGUAGE_COOKIE, THEME_STORAGE_KEY } from '../utils/preferences'

export interface LegalLink {
  label: string
  href: string
  external: boolean
}

export interface LegalSection {
  heading: string
  /** Plain text; "\n" becomes a line break. */
  paragraphs: string[]
  links?: LegalLink[]
}

/** c/o service from online-impressum.de: accepts mail and legal documents for Patrick. */
export const IMPRESSUM_ADDRESS = 'c/o Online-Impressum 11806\nEuroparing 90\n53757 Sankt Augustin'
export const SECOND_CONTACT_URL = 'https://mein.online-impressum.de/kraftpatrickdev/#zweiterkontaktweg'
export const LEGAL_UPDATED = '13.10.2026'

export const impressum: LegalSection[] = [
  {
    heading: 'Angaben gemäß § 5 DDG und § 18 Abs. 1 MStV',
    paragraphs: [`${profile.name}\n${IMPRESSUM_ADDRESS}`],
  },
  {
    heading: 'Kontakt',
    paragraphs: [],
    links: [
      { label: `E-Mail: ${profile.email}`, href: mailto(), external: false },
      { label: 'Zweiter Kontaktweg (Kontaktformular bei online-impressum.de)', href: SECOND_CONTACT_URL, external: true },
    ],
  },
  {
    heading: 'Haftung für Links',
    paragraphs: [
      'Diese Website enthält Links zu externen Websites, auf deren Inhalte ich keinen Einfluss habe. Für die Inhalte der verlinkten Seiten ist der jeweilige Anbieter verantwortlich. Wenn mir Rechtsverletzungen bekannt werden, entferne ich solche Links umgehend.',
    ],
  },
]

export const datenschutz: LegalSection[] = [
  {
    heading: 'Verantwortlicher',
    paragraphs: [
      'Verantwortlich für die Datenverarbeitung auf dieser Website ist:',
      `${profile.name}\n${IMPRESSUM_ADDRESS}\nE-Mail: ${profile.email}`,
    ],
  },
  {
    heading: 'Hosting und Server-Logfiles',
    paragraphs: [
      'Diese Website liegt bei einem externen Hosting-Anbieter, der die Daten in meinem Auftrag verarbeitet. Wenn du die Website aufrufst, verarbeitet er automatisch Daten, die dein Browser übermittelt: IP-Adresse, Datum und Uhrzeit des Abrufs, aufgerufene Seite, übertragene Datenmenge, Referrer sowie Browser und Betriebssystem. Diese Daten werden in Server-Logfiles gespeichert, damit die Website sicher und stabil läuft.',
      'Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Mein berechtigtes Interesse liegt im sicheren und fehlerfreien Betrieb der Website. Die Logfiles werden nach den Vorgaben des Hosting-Anbieters gelöscht.',
    ],
  },
  {
    heading: 'Keine Analyse, kein Tracking',
    paragraphs: [
      'Ich setze keine Analyse- oder Tracking-Werkzeuge ein und binde keine Inhalte von Drittanbietern ein. Die Schriftarten werden von diesem Server geladen, nicht von einem externen Dienst.',
    ],
  },
  {
    heading: 'Gespeicherte Einstellungen',
    paragraphs: [
      `Damit die Website deine Sprachwahl behält, speichert sie ein Cookie namens „${LANGUAGE_COOKIE}“ mit dem Kürzel der gewählten Sprache. Deine Wahl zwischen hellem und dunklem Design speichert sie im lokalen Speicher deines Browsers (localStorage, Schlüssel „${THEME_STORAGE_KEY}“).`,
      'Beides bleibt auf deinem Gerät, enthält keine Angaben zu deiner Person und ist für die von dir gewünschte Funktion erforderlich (§ 25 Abs. 2 Nr. 2 TDDDG). Du kannst beides jederzeit in deinem Browser löschen.',
    ],
  },
  {
    heading: 'Kontakt per E-Mail oder Kontaktformular',
    paragraphs: [
      'Wenn du mir schreibst, verarbeite ich deine Angaben, um deine Anfrage zu beantworten. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO, wenn deine Anfrage auf einen Vertrag zielt, sonst Art. 6 Abs. 1 lit. f DSGVO. Ich lösche die Daten, sobald sie für die Bearbeitung nicht mehr nötig sind und keine gesetzlichen Aufbewahrungspflichten bestehen.',
      'Der zweite Kontaktweg im Impressum ist ein Kontaktformular bei online-impressum.de. Wenn du es nutzt, gilt dort die Datenschutzerklärung von online-impressum.de.',
    ],
  },
  {
    heading: 'Links zu anderen Websites',
    paragraphs: [
      'Diese Website verlinkt auf LinkedIn, GitHub, itch.io und berrybit.dev. Erst wenn du einen Link anklickst, werden Daten an den jeweiligen Anbieter übertragen. Dort gelten dessen Datenschutzbestimmungen.',
    ],
  },
  {
    heading: 'Deine Rechte',
    paragraphs: [
      'Du hast das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung der Verarbeitung deiner Daten, auf Datenübertragbarkeit sowie auf Widerspruch gegen die Verarbeitung (Art. 15 bis 21 DSGVO). Schreib mir dafür an die oben genannte E-Mail-Adresse. Außerdem kannst du dich bei einer Datenschutz-Aufsichtsbehörde beschweren (Art. 77 DSGVO).',
    ],
  },
]
```

- [ ] **Step 4: Run the tests and watch them pass**

Run: `npm test`
Expected: PASS, including 7 tests in `tests/legal.test.ts`.

- [ ] **Step 5: Create `app/components/LegalPage.vue`**

```vue
<script setup lang="ts">
import { LEGAL_UPDATED, type LegalSection } from '~/data/legal'

defineProps<{ title: string; sections: LegalSection[] }>()
const { t, locale } = useI18n()
</script>

<template>
  <div class="page page-frame">
    <section class="block">
      <KrSectionHeading as="h1" :title="title" :lead="locale === 'de' ? undefined : t('legal.germanOnly')" />
      <div class="legal prose" lang="de">
        <section v-for="section in sections" :key="section.heading" class="legal__section">
          <h2 class="legal__heading">{{ section.heading }}</h2>
          <p v-for="(paragraph, i) in section.paragraphs" :key="i" class="legal__paragraph">{{ paragraph }}</p>
          <ul v-if="section.links?.length" class="legal__links">
            <li v-for="link in section.links" :key="link.href">
              <a
                class="kr-link"
                :href="link.href"
                :target="link.external ? '_blank' : undefined"
                :rel="link.external ? 'noopener noreferrer' : undefined"
              >{{ link.label }}<template v-if="link.external"> ↗</template></a>
            </li>
          </ul>
        </section>
        <p class="legal__updated">{{ t('legal.updated', { date: LEGAL_UPDATED }) }}</p>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
@use '~/assets/scss/mixins' as *;

.legal {
  gap: var(--space-8);
}

.legal__section {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.legal__heading {
  color: var(--ink);
  @include type-subheading;
}

.legal__paragraph {
  white-space: pre-line;
}

.legal__links {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.legal__updated {
  color: var(--ink-faint);
  @include type-label;
}
</style>
```

- [ ] **Step 6: Create `app/pages/impressum.vue` and `app/pages/datenschutz.vue`**

`app/pages/impressum.vue`:

```vue
<script setup lang="ts">
import { impressum } from '~/data/legal'

const { t } = useI18n()
usePageMeta('impressum')
</script>

<template>
  <LegalPage :title="t('meta.impressum.title')" :sections="impressum" />
</template>
```

`app/pages/datenschutz.vue`:

```vue
<script setup lang="ts">
import { datenschutz } from '~/data/legal'

const { t } = useI18n()
usePageMeta('datenschutz')
</script>

<template>
  <LegalPage :title="t('meta.datenschutz.title')" :sections="datenschutz" />
</template>
```

- [ ] **Step 7: Generate and check**

```bash
npm run generate
grep -c "Europaring 90" .output/public/impressum/index.html
grep -c "zweiterkontaktweg" .output/public/en/impressum/index.html
grep -c "i18n_redirected" .output/public/datenschutz/index.html
```

Expected: generate succeeds, each grep prints `1` or more.

- [ ] **Step 8: Verify in the browser**

Start `portfolio-dev`.

1. **Impressum:** `/impressum` shows "Impressum", then "Patrick Kraft", the c/o address on three lines, the email link and the "Zweiter Kontaktweg … ↗" link, which opens online-impressum.de in a new tab. "Stand: 13.10.2026" sits at the bottom.
2. **English legal pages:** `/en/impressum` shows "Legal notice", the German-only note as the lead, and the same German text (`lang="de"` on the text block).
3. **Datenschutz:** `/datenschutz` shows 7 sections; the footer link "Datenschutz" has no lamp dot (it isn't in the nav).
4. **Language switch (Review Focus 1):** on `/datenschutz` click "English" and land on `/en/datenschutz`.

- [ ] **Step 9: Commit**

```bash
git add app/data/legal.ts app/components/LegalPage.vue app/pages/impressum.vue app/pages/datenschutz.vue tests/legal.test.ts
git commit -m "feat: add Impressum and Datenschutz with the online-impressum c/o address"
```

---

### Task 10: Static build, README and final verification

**Files:**
- Modify: `nuxt.config.ts` (prerender routes), `README.md`

**Interfaces:**
- Consumes: everything above.
- Produces: a static site in `.output/public` with 10 prerendered pages plus `404.html`.

- [ ] **Step 1: List the routes to prerender in `nuxt.config.ts`**

Add this top-level key after the `i18n` block, inside `defineNuxtConfig({ ... })`:

```ts
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: [
        '/',
        '/en',
        '/projects',
        '/en/projects',
        '/about',
        '/en/about',
        '/impressum',
        '/en/impressum',
        '/datenschutz',
        '/en/datenschutz',
      ],
    },
  },
```

- [ ] **Step 2: Generate and check every page, head tag and asset**

```bash
npm test
npm run generate
for p in index en/index projects/index en/projects/index about/index en/about/index impressum/index en/impressum/index datenschutz/index en/datenschutz/index 404; do
  test -s ".output/public/$p.html" && echo "ok $p" || echo "MISSING $p"
done
grep -o 'hreflang="[a-zA-Z-]*"' .output/public/index.html | sort -u
grep -o '<html[^>]*>' .output/public/en/about/index.html
grep -o '<title>[^<]*</title>' .output/public/projects/index.html
grep -c 'og.jpg' .output/public/index.html
find .output/public -iname "*.pdf" | wc -l
```

Expected:

- Tests PASS, and all 11 lines say `ok`.
- The hreflang values include `de-DE`, `en-US` and `x-default`.
- The `<html>` tag has `lang="en-US"`.
- The title is `<title>Patrick Kraft · Projekte</title>`.
- The og.jpg count is ≥ 1, and the PDF count is `0`.

- [ ] **Step 3: Verify the static build in the browser**

Start the `portfolio-static` preview (`http://localhost:4173/`).

1. **First visit from an English browser (Review Focus 3):**
   - In the page, clear the language cookie: `document.cookie = 'i18n_redirected=; Max-Age=0; path=/'`.
   - Check `navigator.languages` and reload `/`. If the first language isn't German, you land on `/en/`; if it is German, you stay on `/`.
   - Then click the language button to pick German explicitly ("Deutsch" if you're on `/en/`). Reload `/`: it stays German, and `document.cookie` contains `i18n_redirected=de`.
2. **Theme (Review Focus 2):**
   - Run `localStorage.setItem('theme', 'blue')` and reload: the page renders in the system theme with no console error.
   - Toggle to Day and reload: Day, with no dark flash.
3. **Click through every page in both languages:**
   - Header links, "Alle Projekte →", "Ganzer Werdegang →", footer links, and every external link (correct targets, new tab).
   - The language switch keeps the page on all five pages.
4. **Phone widths:** at 320×700 run `document.documentElement.scrollWidth <= window.innerWidth` on all ten pages. Expected: `true`.
5. **Keyboard only:** Tab through Home. Every focusable element shows the lamp focus ring, and the order is skip link → wordmark → nav → switches → content → footer.

- [ ] **Step 4: Replace `README.md`**

````markdown
# kraftpatrick.dev

The source of my personal site: who I am, what I build and how to reach me. German at `/`, English at `/en`.

## Stack

Nuxt 4, Vue 3, TypeScript, SCSS and `@nuxtjs/i18n`. Static output from `nuxt generate`, fonts self-hosted, no tracking.

The look comes from my design system "Patrick Kraft": Night and Day themes, Newsreader, Geist and Geist Mono. The design spec is in `docs/superpowers/specs/2026-10-13-portfolio-redesign-design.md`.

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
````

- [ ] **Step 5: Final test run and commit**

```bash
npm test
git status --short
git add nuxt.config.ts README.md
git commit -m "build: prerender all localized routes and document the project"
git log --oneline master..redesign
```

Expected:

- Tests PASS.
- Before the add, `git status --short` lists ` M README.md`, ` M nuxt.config.ts` and `?? .claude/`, nothing else. `.output/` is ignored.
- The log shows the spec commit, the plan commit and ten task commits, none with a `Co-Authored-By` line.
