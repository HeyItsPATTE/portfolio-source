import { rootRedirectScript } from './app/utils/root-redirect'
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
      script: [
        { innerHTML: rootRedirectScript, tagPriority: 'critical' },
        { innerHTML: themeInitScript, tagPriority: 'critical' },
      ],
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
    // Off on purpose: rootRedirectScript redirects "/" before hydration (no German flash, crawlers
    // stay on the German home) and LangSwitch writes the language cookie on an explicit choice.
    detectBrowserLanguage: false,
  },
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
})
