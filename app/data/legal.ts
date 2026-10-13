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
