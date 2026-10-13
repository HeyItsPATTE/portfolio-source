import type { Locale } from '../data/types'
import { LANGUAGE_COOKIE } from './preferences'

const ONE_YEAR = 60 * 60 * 24 * 365

/** The cookie that remembers an explicit language choice (set by the language switch only). */
export function languageCookie(locale: Locale): string {
  return `${LANGUAGE_COOKIE}=${locale}; path=/; max-age=${ONE_YEAR}; samesite=lax`
}

/**
 * Runs in <head> on every page but acts only on "/", before the German static page hydrates.
 * This is the site's only language redirect (@nuxtjs/i18n's detection is off, see nuxt.config):
 * - a remembered choice (cookie) wins;
 * - otherwise the first of German or English in the browser's list, and English for browsers
 *   that prefer neither;
 * - crawlers stay on the German home, so it remains the indexed x-default page.
 */
// Named crawler tokens and a standalone "bot" word only: "CUBOT" phones or "PreviewApp" browsers are people.
export const rootRedirectScript = `(function(){if(location.pathname!=='/')return;if(/(?:google|bing|duckduck|yandex|apple|linkedin|twitter|petal|semrush|ahrefs|mj12)bot|\\bbot\\b|\\bcrawler\\b|spider|slurp|facebookexternalhit|lighthouse/i.test(navigator.userAgent||''))return;var m=document.cookie.match(/(?:^|; )${LANGUAGE_COOKIE}=([^;]*)/),p=m?m[1]:null;if(!p){p='en';var ls=navigator.languages||[navigator.language||''];for(var i=0;i<ls.length;i++){var l=String(ls[i]).slice(0,2).toLowerCase();if(l==='de'||l==='en'){p=l;break}}}if(p==='en')location.replace('/en'+location.search+location.hash)})()`
