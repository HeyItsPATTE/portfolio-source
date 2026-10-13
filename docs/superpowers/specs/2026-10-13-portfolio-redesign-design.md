# kraftpatrick.dev redesign — design spec

- **Date:** 2026-10-13
- **Branch:** `redesign`
- **Design system (source of truth for look):** "Patrick Kraft" — https://claude.ai/artifact/SMjWQvfTSoZHiashqVTyUF (version `1791877781-637f`)
- **Approved mockups:** canvas https://claude.ai/artifact/Dyq61D84XzTiwtHPtFRZXs, artboards **"C · Rooms: home (recruiter-first)"** and **"C · Rooms: about"**. Directions A and B on the same canvas were not chosen.

## 1. Goal

Rebuild the portfolio from scratch as a calm, professional, bilingual (German/English) site in the "Patrick Kraft" design system. Nothing from the previous code or the old Claude Design bundle (`.claude/design-ref`) is reused; that bundle was rejected as looking like a generic AI template.

**Audience, in priority order**

1. Recruiters and hiring managers at German companies. They skim; the first screen must answer *who, what, where, training status, how to reach him*.
2. Technical reviewers. They look for real projects, Patrick's own part in them, the stack and code.
3. Friends and the BerryBit / FiveM community.

**Status framing:** Patrick is **not looking** for a job or internship. The site is recruiter-ready, not a job ad: no availability badge, no "hire me" copy. The internship dates and expected graduation appear only as facts.

**Success criteria**

- On Home, above the fold at 1440×900 and within the first two screens on a 375px phone: name, photo, role, location, training and graduation year, and a contact action.
- Every statement on the site is a real fact from GitHub, LinkedIn, the CV or the repos. No invented numbers, no skill bars.
- Both languages complete for every page; switching keeps the visitor on the same page.
- Follows the design system's rules: one lamp accent per screen, no gradients/glows/glass, no emoji, sentence case, hairlines instead of color blocks, text contrast ≥ 4.5:1 in both themes.
- `npm run generate` produces a static site that runs on any static host.

## 2. Content rules (decided with Patrick)

- **Projects shown:** LACNR, BerryBase, Undercrown, Survive Tonight, BerryBit website. **Never shown:** anything KRFT / KRAFT Software Solutions (incl. Home Office Tracker), Two Shores, IronLog.
- **BerryBit is a hobby** game group with friends, never a job or company role.
- **Undercrown** is Patrick's own game built in his free time; the repo is private, so its card has no link.
- **Contact:** email `kraftpatrick@gmx.net` (primary), LinkedIn `https://www.linkedin.com/in/patrick-kraft-8a1472393/`, GitHub `https://github.com/HeyItsPATTE`, Discord `heyitspatte`.
- **CV on request only.** No CV file is published. CV buttons open a `mailto:` with a prefilled subject ("Anfrage Lebenslauf" / "CV request").
- **Private data stays off the site:** street address, phone, date and place of birth, signature (all in the CV PDF). The Impressum uses a c/o address from online-impressum.de instead of a home address (§4.5).
- **Location:** Recklinghausen, NRW.
- **Languages:** German (native), English (good), Italian (good). The CV is the source; LinkedIn's "fluent" is not used.
- **Third parties:** LACNR's co-developer is "a friend" / "zu zweit", not named.

## 3. Information architecture

`@nuxtjs/i18n`, strategy `prefix_except_default`, default locale `de`.

| Page | German | English | Purpose |
| --- | --- | --- | --- |
| Home | `/` | `/en` | Recruiter-first overview |
| Projects | `/projects` | `/en/projects` | All five projects |
| About | `/about` | `/en/about` | Story, photo, full experience and education |
| Impressum | `/impressum` | `/en/impressum` | Legal notice (German legal text) |
| Datenschutz | `/datenschutz` | `/en/datenschutz` | Privacy policy (German legal text) |
| 404 | `error.vue` | same | Short message plus a link home |

Path slugs are the same in both locales (no localized slugs).

**Language detection:** on a visit to the root, a browser whose preferred language isn't German is sent to `/en`.

- A small head script (`app/utils/root-redirect.ts`) does this before hydration, and it is the only language redirect. `@nuxtjs/i18n`'s `detectBrowserLanguage` is off.
- A remembered choice wins. Otherwise the first of German or English in the browser's list counts. Browsers that prefer neither get English.
- Crawlers stay on the German home, so it stays indexed as the x-default page.
- The cookie `i18n_redirected` is written only when the visitor uses the language switch. It stores that choice and is listed in the Datenschutz.

(Revised 2026-10-13 after the final review; the module's own detection redirected only after hydrating German markup, and it redirected crawlers too.)

## 4. Pages

All copy for every page, in both languages, is in Appendix A.

### 4.1 Global chrome

- **Skip link** to `#main`, visible on focus.
- **Header** (`SiteHeader`): page-width frame (`width-page`, `--gutter`), full-width `line` hairline under it, `header-height` tall, on `bg`.
  - Left: wordmark "Patrick Kraft" (Newsreader 500, 20px), linking to the locale's home.
  - Nav: Projects, About, Contact. Contact goes to `<home>#contact`. The current page gets `aria-current="page"` and the lamp dot.
  - Right: `LangSwitch` (ghost sm button labelled with the *other* language's name: "English" on German pages, "Deutsch" on English pages; switches to the same page in that locale) and `ThemeToggle` (ghost sm, label "Tag"/"Day" in Night, "Nacht"/"Night" in Day, with a descriptive `aria-label`).
- **Under 640px:** the header shows only the wordmark and a ghost "Menü"/"Menu" button; nav, language switch and theme toggle move into the menu. The button opens a `MobileMenu` panel on `surface-raised` with the nav links, the language switch and the theme toggle. Esc and the close button close it, focus returns to the menu button, and background scroll is locked while open.
- **Footer:** `© <current year> Patrick Kraft · Gebaut mit Nuxt, Vue und SCSS.` (EN: "Built with …"), plus links Impressum / Datenschutz ("Legal notice" / "Privacy" in English).

### 4.2 Home (recruiter-first)

Matches canvas artboard "C · Rooms: home (recruiter-first)". In order:

1. **Identity row:** 72px round portrait, name (Newsreader 21px/500), mono id line ("anwendungsentwickler in umschulung · recklinghausen"). *Deliberate deviation:* the design system puts the portrait on About only; Home gets this small avatar because recruiters expect a face.
2. **Headline** in `display` style with one italic word: "Ich baue Software mit C# und Vue und arbeite *genau* nach Vorgabe."
3. **Lead** (`lead`, `ink-muted`, max `width-prose`).
4. **Actions:** primary "Schreib mir eine E-Mail" (`mailto:kraftpatrick@gmx.net`); secondary "Zu meinen Projekten" (to `/projects`).
5. **At a glance:** `<dl>` grid between two hairlines with five facts: role, training, graduation, based in, languages.
6. **01 · Ausgewählte Projekte:** `SectionHeading` with lead, an "Alle Projekte →" link to `/projects`, and three `ProjectCard`s: LACNR, BerryBase, Undercrown.
7. **02 · Stack:** five rows (label in mono left, `Tag`s right): languages, frameworks, testing, tools, AI tools.
8. **03 · Werdegang:** `SectionHeading` with lead, a "Ganzer Werdegang →" link to `/about`, and three `TimelineItem`s: WBS retraining, Capricorn, CSL Behring.
9. **04 · Kontakt** (`id="contact"`): a card on `surface` with `line` border and `radius-lg`. `SectionHeading` with lead; buttons: primary email, secondary "LinkedIn ↗", ghost "Lebenslauf anfragen" (mailto with subject). Below them a text row: email link, GitHub ↗, "Discord: heyitspatte".

### 4.3 Projects

- `SectionHeading` as the page title (`h1`, eyebrow "projekte"), plus a lead.
- Grid of five `ProjectCard`s in this order: LACNR, BerryBase, Undercrown, Survive Tonight, BerryBit website. Three columns on desktop, two on tablet, one on phone, `space-6` gaps.
- Cards are whole-card links when a public URL exists (`external`, opens a new tab, ↗):
  - Survive Tonight: `https://berrybit.itch.io/survive-tonight`
  - BerryBit website: `https://berrybit.dev`
  - BerryBase: `https://github.com/BerryBitStudios/berrybase-releases`
  - LACNR and Undercrown have no public link and render as non-link `<article>` cards.
- No screenshots in v1. Cards stay text-only; the `image` prop is supported for later.

### 4.4 About

Matches canvas artboard "C · Rooms: about".

- Two columns that wrap on narrow screens:
  - **Left:** eyebrow, `title` "Vom Reinraum *zum Code*", lead, three body paragraphs.
  - **Right:** square portrait (`radius-lg`, `line` border), then a `<dl>`: based in, languages, outside work, and CV ("Auf Anfrage per E-Mail" as a mailto link).
- **Berufserfahrung** (`SectionHeading`): four `TimelineItem`s, newest first: WBS retraining 2026–2028, Capricorn 2025, CSL Behring 2023–2025, Servicekraft 2020–2023.
- **Ausbildung:** three `TimelineItem`s: Erzieher training 2019–2020 (not completed), Sozialassistent 2016–2019, Realschulabschluss 2006–2016.
- **Actions:** primary "Lebenslauf anfragen" (mailto with subject), secondary "Zu meinen Projekten".

### 4.5 Impressum and Datenschutz

- German legal text on both locales. English pages show an English heading and one sentence saying the legal text is in German.
- **Impressum:** our own page, not an embed:
  - Name and the c/o address from online-impressum.de: `Patrick Kraft, c/o Online-Impressum 11806, Europaring 90, 53757 Sankt Augustin`.
  - Email `kraftpatrick@gmx.net`.
  - A "Zweiter Kontaktweg" link to `https://mein.online-impressum.de/kraftpatrickdev/#zweiterkontaktweg`, which opens their contact form.
  - A short "Haftung für Links" note.
  - No supervisory-authority line: not required for this site, and it would go stale with the move to NRW.
- **Datenschutz:**
  - Controller: name, the same c/o address, email.
  - Hosting and server logs: the host is named by category only, "an external hosting provider", as the GDPR allows.
  - No tracking, no analytics, no third-party embeds, fonts self-hosted.
  - One functional cookie `i18n_redirected` for the language choice; `localStorage` key `theme` for the theme choice.
  - Contact by email or by the online-impressum.de form (their privacy policy applies there).
  - Links to other sites; data-subject rights.
- These are drafts, not legal advice.

## 5. Visual system

- **Tokens:** copied verbatim from the design system's `tokens.json` into `app/assets/scss/_tokens.scss` as CSS custom properties. Night (`dark`) is on `:root`, Day (`light`) on `:root[data-theme="day"]`. Includes colors, `shadow-lift`, `focus-ring`, spacing, radii, `width-prose`, `width-page`, `header-height`. Values are in Appendix B.
- **Fonts:** `Newsreader-Variable.woff2`, `Newsreader-Italic-Variable.woff2`, `Geist-Variable.woff2`, `GeistMono-Variable.woff2` copied from the design system into `public/fonts/`, with their three OFL license files in `public/fonts/licenses/`. Declared with `@font-face`, `font-display: swap`; Newsreader and Geist are preloaded.
- **Type styles** (`display`, `title`, `heading`, `subheading`, `lead`, `body`, `small`, `label`, `code`) as SCSS mixins with the design system's sizes. Phones: `display` 44/48, `title` 34/40.
- **Theme:**
  - The first visit follows `prefers-color-scheme` (light → Day, otherwise Night). A toggle choice is saved to `localStorage.theme`.
  - A tiny inline script in `<head>` sets `data-theme` on `<html>` before first paint, so there is no flash. `useTheme()` keeps it in sync after hydration.
- **Motion:**
  - Colors and hover: 180ms `cubic-bezier(0.2, 0.7, 0.2, 1)`. Card hover: lift 2px over 240ms.
  - Page content fades in once on load (opacity plus 8px rise, 320ms, staggered 60ms per section).
  - All of it is disabled under `prefers-reduced-motion: reduce`.
- **Portrait:** the photo Patrick attached on 2026-10-13, saved as `public/images/patrick-kraft.webp`.
- **OG image:** `public/images/og.jpg`, 1200×630: the portrait on `bg` with the name in Newsreader.

## 6. Architecture

Same stack as today: Nuxt 4 (`app/` directory), Vue 3, TypeScript, SCSS (`sass-embedded`). New dependencies: `@nuxtjs/i18n` (runtime); `vitest` (dev). No UI library, no CSS framework.

```
app/
  app.vue                  shell: skip link, SiteHeader, <NuxtPage>, SiteFooter
  error.vue                404 / error page
  assets/scss/
    _tokens.scss           CSS custom properties (Night + Day)
    _fonts.scss            @font-face
    _mixins.scss           type styles, breakpoints, focus ring
    _kr.scss               global port of the design system's bundle.css
    _layout.scss           page frame, sections, grids shared by pages
    main.scss              reset, base, ::selection, reduced motion
  components/
    kr/                    design-system components (auto-imported as Kr*)
      Button.vue           variant primary|secondary|ghost, size md|sm, renders <a> when href
      Tag.vue              tone neutral|lamp
      SectionHeading.vue   eyebrow, title, as (h1|h2|h3), default slot = lead
      ProjectCard.vue      title, meta, summary, tags, href, external, image, imageAlt, as
      TimelineItem.vue     period, title, place, default slot = text
    SiteHeader.vue
    MobileMenu.vue
    LangSwitch.vue
    ThemeToggle.vue
    SiteFooter.vue
    FactList.vue           <dl> grid used on Home and About
    StackList.vue          labelled tag rows
    LegalPage.vue          shared layout of Impressum and Datenschutz
  composables/
    useTheme.ts            read/apply/toggle/persist theme
    useLocalized.ts        pick the current locale from a Localized<T>
    useNavLinks.ts         header and mobile-menu links with current state
    usePageMeta.ts         per-page title, description, Open Graph
  utils/
    preferences.ts         storage key "theme" and cookie "i18n_redirected" (code and Datenschutz share them)
    theme.ts               pure theme logic + the inline head script
  data/
    types.ts               Locale, Localized<T>, Project, TimelineEntry, StackGroup, Fact
    profile.ts             name, email, links, portrait path
    projects.ts            the five projects (order, featured flag, links)
    timeline.ts            experience + education entries (home flag)
    stack.ts               stack groups
    facts.ts               at-a-glance facts
    legal.ts               Impressum and Datenschutz text (German), c/o address
  pages/
    index.vue  projects.vue  about.vue  impressum.vue  datenschutz.vue
i18n/
  locales/de.json en.json  UI strings: nav, buttons, headings, leads, labels, legal
public/
  fonts/…  images/patrick-kraft.webp  images/patrick-kraft-avatar.webp  images/og.jpg  robots.txt  favicon.ico
scripts/
  make-images.py           builds portrait, avatar and OG image from the source photo (Pillow)
tests/
  i18n.test.ts             de.json and en.json have identical key sets, no empty values, no vue-i18n syntax chars
  content.test.ts          every Localized field has non-empty de+en; ≤ 4 tags per project;
                           only cleared project slugs; no "KRFT"/"KRAFT Software"; no private CV data; no .pdf in public/
  theme.test.ts            initial theme resolution and the inline head script
  assets.test.ts           fonts, licenses and images exist in public/
  components.test.ts       kr/ components render like the design system's bundle
  legal.test.ts            Impressum/Datenschutz contain the required facts and match the real cookie/storage keys
nuxt.config.ts             i18n, css, app.head (inline theme script, font preloads), nitro prerender
```

**Data model**

```ts
type Locale = 'de' | 'en'
type Localized<T = string> = Record<Locale, T>

interface Project {
  slug: 'lacnr' | 'berrybase' | 'undercrown' | 'survive-tonight' | 'berrybit-website'
  title: string
  meta: Localized
  summary: Localized
  tags: string[]          // ≤ 4, source spelling
  href?: string           // public URL only
  featured: boolean       // shown on Home
}

interface TimelineEntry {
  kind: 'work' | 'education'
  period: Localized       // en dash, no spaces
  title: Localized
  place: string
  text?: Localized        // short text, used on Home and About
  textLong?: Localized    // replaces text on About when present
  onHome: boolean
}

interface StackGroup { label: Localized; items: string[] }
interface Fact { label: Localized; value: Localized }
```

Structured content lives in `app/data/*.ts` with both languages side by side. Interface strings (nav, buttons, headings, leads, legal text) live in `i18n/locales/*.json`. Components never contain copy.

**Design-system parity:** the `kr/` components reproduce `bundle.css` from the design system, including class names (`kr-btn`, `kr-card`, …), states and reduced-motion rules. Those styles live in one global partial, `app/assets/scss/_kr.scss`, because the `kr-` classes are the system's public API, exactly as in the bundle. That also lets elements outside the components use them, such as the mobile menu's trigger. Behavior matches `bundle.js` (e.g. a ProjectCard with `href` is an `<a>`, without it an `<article>`; external shows ↗ and opens a new tab with `rel="noopener noreferrer"`).

## 7. SEO and meta

- `useLocaleHead` for `<html lang>`, `hreflang` alternates (`de`, `en`, `x-default` → `de`) and canonical URLs. Site URL `https://kraftpatrick.dev` (from the README).
- Per page and locale: `<title>` ("Patrick Kraft · Projekte" …; Home: "Patrick Kraft · Anwendungsentwickler in Umschulung"), meta description, Open Graph title/description/image/locale.
- `robots.txt` allows everything. No sitemap in v1.

## 8. Accessibility

- Every interactive element shows `focus-ring` on `:focus-visible`. Inline links are always underlined (`kr-link`).
- Hit targets ≥ 40px, with extra padding around `sm` buttons on touch layouts.
- Landmarks: `header`, `nav` (labelled), `main#main`, `footer`. One `h1` per page and a logical heading order.
- `lang` on `<html>` follows the locale. The portrait has alt text in both languages.
- The mobile menu is a real dialog pattern: focus moves in, Esc closes, focus returns.
- Text tokens hold 4.5:1 on their grounds in both themes (values from the design system).

## 9. Testing and verification

- **Unit tests (Vitest, TDD for data and composables):**
  - i18n key parity and no empty strings.
  - Content completeness and content rules (§2).
  - `useTheme` resolves initial theme from storage, then `prefers-color-scheme`, then Night.
- **Build:** `npm run generate` succeeds and prerenders all ten routes (five pages × two locales).
- **Manual pass in the browser preview:**
  - Every page at 375px, 768px and 1440px; Night and Day; German and English.
  - Keyboard-only tab-through; reduced motion; no horizontal scroll on phones.
  - The language switch keeps the current page; the theme survives a reload with no flash.

## 10. Out of scope (v1)

Project detail / case-study pages, screenshots, blog, contact form, analytics, sitemap, CV page or download, availability badge, CMS.

## 11. Open items

| Item | Owner | Blocks |
| --- | --- | --- |
| Hosting provider and deploy target | Patrick | Launch, not development |
| Screenshots for project cards | Later | Nothing |

Resolved on 2026-10-13: Impressum address (c/o online-impressum.de, §4.5).

---

## Appendix A — Copy

German is the default locale; English follows each block. Mono labels and eyebrows are lowercase on purpose.

### Chrome

| Key | de | en |
| --- | --- | --- |
| nav.projects | Projekte | Projects |
| nav.about | Über mich | About |
| nav.contact | Kontakt | Contact |
| lang.switch | English | Deutsch |
| theme.toDay / toNight | Tag / Nacht | Day / Night |
| theme.ariaToDay / ariaToNight | Tag: helles Design einschalten / Nacht: dunkles Design einschalten | Day: switch to the light theme / Night: switch to the dark theme |
| menu.open / close | Menü / Schließen | Menu / Close |
| skip | Zum Inhalt springen | Skip to content |
| footer.built | Gebaut mit Nuxt, Vue und SCSS. | Built with Nuxt, Vue and SCSS. |
| footer.legal / privacy | Impressum / Datenschutz | Legal notice / Privacy |
| cv.subject | Anfrage Lebenslauf | CV request |
| portrait.alt | Patrick Kraft in dunklem Sakko und weißem Hemd, leicht lächelnd | Patrick Kraft in a dark blazer and white shirt, smiling slightly |

### Home

- **id line:** anwendungsentwickler in umschulung · recklinghausen / application developer in training · recklinghausen
- **headline:** Ich baue Software mit C# und Vue und arbeite *genau* nach Vorgabe. / I build software in C# and Vue, and I work *exactly* to spec.
- **lead:**
  - de: Ich mache eine Umschulung zum Fachinformatiker für Anwendungsentwicklung (IHK), Abschluss voraussichtlich 2028. Davor war ich zweieinhalb Jahre in der pharmazeutischen Produktion, meist im GMP-Reinraum, wo jeder Schritt nach Vorgabe läuft und dokumentiert wird.
  - en: I'm retraining as a Fachinformatiker für Anwendungsentwicklung (IHK), finishing in 2028. Before that I spent two and a half years in pharmaceutical production, mostly in a GMP cleanroom, where every step is done to spec and documented.
- **buttons:** Schreib mir eine E-Mail · Zu meinen Projekten / Write me an email · See my projects
- **at a glance** (label → value):
  - rolle → Fachinformatiker AE in Umschulung / role → Application developer in training
  - umschulung → WBS Training, seit 01/2026 / training → WBS Training, since 01/2026
  - abschluss → IHK, voraussichtlich 2028 / graduation → IHK, expected 2028
  - wohnort → Recklinghausen, NRW / based in → Recklinghausen, NRW
  - sprachen → Deutsch, Englisch, Italienisch / languages → German, English, Italian
- **01:**
  - eyebrow: 01 · ausgewählte projekte / 01 · selected work
  - title: Ausgewählte Projekte / Selected work
  - lead: Was ich gebaut habe, was mein Teil war und womit. / What I built, which part was mine, and with what.
  - link: Alle Projekte → / All projects →
- **02:**
  - eyebrow: 02 · stack
  - title: Womit ich arbeite / What I work with
  - lead: Keine Skill-Balken. Nur, was ich wirklich eingesetzt habe, in Projekten oder in der Umschulung. / No skill bars. Only things I've used, in my projects or in my training.
  - groups:
    - sprachen / languages: C#, Java, TypeScript, JavaScript, SQL
    - frameworks: .NET, Blazor, Avalonia, Vue, Nuxt, Unity
    - testen / testing: xUnit, bUnit, Vitest, Playwright
    - werkzeuge / tools: Git, GitHub, Docker, MySQL, IntelliJ IDEA, UML
    - ki-werkzeuge / ai tools: Claude Code, Codex, Ollama
- **03:**
  - eyebrow: 03 · werdegang / 03 · background
  - title: Vom Reinraum zum Code / From the cleanroom to code
  - lead:
    - de: Ich habe bewusst den Beruf gewechselt. Die Produktion unter GMP hat mir beigebracht, nach Vorgabe zu arbeiten, jeden Schritt zu dokumentieren und Qualität ernst zu nehmen. Das bringe ich in die Softwareentwicklung mit.
    - en: I changed careers on purpose. Production under GMP taught me to work to spec, document every step and take quality seriously. I bring that to software.
  - link: Ganzer Werdegang → / Full background →
- **04:**
  - eyebrow: 04 · kontakt / 04 · contact
  - title: Kontakt / Get in touch
  - lead:
    - de: Am besten erreichst du mich per E-Mail, meinen Lebenslauf schicke ich dir auf Anfrage. Du findest mich auch auf LinkedIn und GitHub.
    - en: Email is the best way to reach me, and I'll send my CV on request. I'm also on LinkedIn and GitHub.
  - buttons: Schreib mir eine E-Mail · LinkedIn ↗ · Lebenslauf anfragen / Write me an email · LinkedIn ↗ · Request my CV

### Projects page

- **eyebrow / title:** projekte · Projekte / projects · Projects
- **lead:** Alles, was ich gebaut habe oder gerade baue: Web, Desktop und Spiele, allein und mit Freunden. / Everything I've built or am building: web, desktop and games, alone and with friends.

| Project | meta (de / en) | summary de | summary en | tags | link |
| --- | --- | --- | --- | --- | --- |
| LACNR | web · .net 10 · 2026 | Website einer FiveM-Community, zu zweit gebaut: erst Vue 3 mit eigener API, dann von mir nach Blazor auf .NET 10 portiert, mit xUnit-Tests und Docker. 128 der 142 Commits sind von mir. | Website for a FiveM community, built as a team of two: first Vue 3 with its own API, then ported by me to Blazor on .NET 10 with xUnit tests and Docker. 128 of 142 commits are mine. | Blazor, .NET 10, Vue 3, xUnit | — |
| BerryBase | desktop-app · c# · 2026 / desktop app · c# · 2026 | Ein Werkzeug für unsere Hobby-Spielegruppe BerryBit, allein gebaut: Avalonia mit MVVM, Live-Daten über SignalR, automatische Updates über Velopack, Builds für Windows und Linux. | A tool for BerryBit, our hobby game group, built alone: Avalonia with MVVM, live data over SignalR, auto-updates through Velopack, builds for Windows and Linux. | C#, Avalonia, MVVM, SignalR | github.com/BerryBitStudios/berrybase-releases |
| Undercrown | spiel · unity · in arbeit / game · unity · in progress | Mein eigenes Spiel, an dem ich in meiner Freizeit baue: ein Low-Poly-Survivalspiel im Mittelalter in Unity und C#, von Anfang an für Multiplayer ausgelegt. | My own game, built in my free time: a low-poly medieval survival game in Unity and C#, designed for multiplayer from day one. | Unity, C#, Multiplayer | — |
| Survive Tonight | game jam · 2025 | Ein kurzer 2D-Horror-Prototyp, in wenigen Tagen mit einem Freund für den Scream Jam 2025 gebaut. Spielbar auf itch.io für Windows, macOS und Linux. | A short 2D horror prototype made in a few days with a friend for Scream Jam 2025. Playable on itch.io for Windows, macOS and Linux. | Game jam, 2D, Horror | berrybit.itch.io/survive-tonight |
| berrybit.dev | web · 2026 | Die zweisprachige Website unserer Hobby-Spielegruppe BerryBit, mit Seiten für Spiele, News und das Team. | The bilingual website of BerryBit, our hobby game group, with pages for games, news and the team. | Nuxt, Vue, i18n | berrybit.dev |

Featured on Home: LACNR, BerryBase, Undercrown.

### About

- **eyebrow / title:** über mich · Vom Reinraum *zum Code* / about · From the cleanroom *to code*
- **lead:**
  - de: Ich bin Patrick und werde gerade Anwendungsentwickler. Meistens arbeite ich an einem Spiel in Unity oder an etwas fürs Web.
  - en: I'm Patrick, an application developer in training. Most days I'm working on a game in Unity or on something for the web.
- **p1:**
  - de: Bevor ich programmiert habe, war ich zweieinhalb Jahre in der pharmazeutischen Produktion, die meiste Zeit im GMP-Reinraum bei CSL Behring in Marburg. Dort läuft jeder Schritt genau nach Vorgabe und wird dokumentiert. Das habe ich mitgenommen: Ich plane, bevor ich baue, und halte fest, was ich gemacht habe.
  - en: Before I wrote code, I spent two and a half years in pharmaceutical production, most of it in a GMP cleanroom at CSL Behring in Marburg. Every step there is done exactly to spec and documented. I kept that habit: I plan before I build, and I write down what I did.
- **p2:**
  - de: Seit Januar 2026 mache ich bei WBS Training eine Umschulung zum Fachinformatiker für Anwendungsentwicklung (IHK). Mein Praktikum läuft von April bis November 2027, den Abschluss mache ich voraussichtlich 2028.
  - en: Since January 2026 I'm retraining as a Fachinformatiker für Anwendungsentwicklung (IHK) at WBS Training. My internship runs from April to November 2027, and I expect to finish in 2028.
- **p3:**
  - de: In meiner Freizeit baue ich Spiele. Mit Freunden betreibe ich BerryBit, eine Hobby-Spielegruppe, aus der Survive Tonight für einen Game Jam entstanden ist, und allein arbeite ich an Undercrown, einem Multiplayer-Survivalspiel in Unity.
  - en: In my free time I build games. With friends I run BerryBit, a hobby game group that made Survive Tonight for a game jam, and on my own I'm working on Undercrown, a multiplayer survival game in Unity.
- **facts:**
  - wohnort → Recklinghausen, NRW / based in → Recklinghausen, NRW
  - sprachen → Deutsch (Muttersprache) · Englisch (gut) · Italienisch (gut) / languages → German (native) · English (good) · Italian (good)
  - in der freizeit → Spieleentwicklung mit Freunden als BerryBit / outside work → Game development with friends as BerryBit
  - lebenslauf → Auf Anfrage per E-Mail / cv → On request by email
- **headings:**
  - berufserfahrung · Wo ich gearbeitet habe / experience · Where I worked
  - ausbildung · Wo ich gelernt habe / education · Where I learned
- **buttons:** Lebenslauf anfragen · Zu meinen Projekten / Request my CV · See my projects

### Timeline entries

| period | title de / en | place | text de / en | kind | on Home |
| --- | --- | --- | --- | --- | --- |
| 2026–2028 | Umschulung Fachinformatiker AE (IHK) / Retraining: application developer (IHK) | WBS Training AG, Marburg | Praktikum vom 05.04. bis 15.11.2027, Abschluss voraussichtlich 2028. / Internship from 5 April to 15 November 2027, graduation expected in 2028. | work | yes |
| 2025 | Mitarbeiter Pulverproduktion / Powder production | Capricorn Scientific GmbH, Dreihausen | Produktionsanlagen nach festgelegten Qualitätsvorgaben bedient. / Ran production equipment to fixed quality specifications. | work | yes |
| 2023–2025 | Laborwerker Bulkproduktion / Bulk production, GMP cleanroom | CSL Behring GmbH, Marburg | Home: Komplexe Anlagen im Reinraum unter GMP bedient und jeden Schritt in MES und Prozessleitsystem dokumentiert. / Ran complex equipment in a GMP cleanroom and documented every step in MES and the process control system. About: Komplexe Anlagen im Reinraum unter GMP bedient, Prozessführung und Dokumentation mit MES und Prozessleitsystem, Arbeit mit pH-Messsystemen nach strengen Qualitätsstandards. / Ran complex equipment in a GMP cleanroom, led and documented processes in MES and the process control system, and worked with pH measurement systems to strict quality standards. | work | yes |
| 2020–2023 | Servicekraft / Service staff | Stadtallendorf | — | work | no |
| 2019–2020 | Ausbildung zum Erzieher / Training as an educator (Erzieher) | BerufsschulCampus Schwalmstadt | Nicht abgeschlossen. / Not completed. | education | no |
| 2016–2019 | Staatlich geprüfter Sozialassistent / State-certified social assistant | BerufsschulCampus Schwalmstadt | — | education | no |
| 2006–2016 | Realschulabschluss | Martin-von-Tours-Schule, Neustadt (Hessen) | — | education | no |

The CSL Behring entry uses the short text on Home and the long text on About (`text` and an optional `textLong`).

## Appendix B — Tokens (from the design system's tokens.json)

| Token | Night (default) | Day |
| --- | --- | --- |
| bg | #131211 | #f5f1ea |
| surface | #1a1917 | #fbf8f3 |
| surface-raised | #22201d | #ffffff |
| line | #2c2a26 | #e3dccf |
| line-control | #777066 | #8e8679 |
| ink | #ece6db | #1e1b17 |
| ink-muted | #b3ab9f | #575047 |
| ink-faint | #8f887d | #6f675c |
| lamp | #e59572 | #a0442a |
| lamp-hover | #eeac8e | #87381f |
| lamp-soft | #33231c | #f4e2d7 |
| on-lamp | #1b120e | #fffaf6 |
| moss | #94c29c | #2f6b40 |
| moss-soft | #1d2a20 | #e1eedf |
| link | = lamp | = lamp |
| shadow-lift | 0 12px 32px -12px #000000b3 | 0 12px 28px -14px #1e1b1733 |
| focus-ring | 0 0 0 2px #131211, 0 0 0 4px #e59572 | 0 0 0 2px #f5f1ea, 0 0 0 4px #a0442a |

**Spacing:** space-1 4, space-2 8, space-3 12, space-4 16, space-6 24, space-8 32, space-12 48, space-16 64, space-24 96 (px).

**Radius:** sm 6, md 10, lg 16, full 9999 (px).

**Layout:** width-prose 680, width-page 1120, header-height 64 (px). Gutters 32px on desktop, 24px on phones; section gap 96px on desktop, 64px on phones.

**Type** (size/line-height, weight):

| Style | Font | Size/line, weight | Notes |
| --- | --- | --- | --- |
| display | Newsreader | 64/68, 400 | -0.02em; phone 44/48 |
| title | Newsreader | 44/50, 400 | -0.015em; phone 34/40 |
| heading | Newsreader | 30/36, 400 | -0.01em |
| subheading | Newsreader | 21/28, 500 | |
| lead | Geist | 19/30, 400 | |
| body | Geist | 16/27, 400 | |
| small | Geist | 14/22, 400 | |
| label | Geist Mono | 12/16, 500 | 0.06em |
| code | Geist Mono | 14/22, 400 | |

Newsreader is never heavier than 500. The italic is used for one word per page.
