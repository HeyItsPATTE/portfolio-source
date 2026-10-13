import { same, type StackGroup } from './types'

/** Only what was used in projects or the retraining. No levels, no bars. */
export const stack: StackGroup[] = [
  { label: { de: 'sprachen', en: 'languages' }, items: ['C#', 'Java', 'TypeScript', 'JavaScript', 'SQL'] },
  { label: same('frameworks'), items: ['.NET', 'Blazor', 'Avalonia', 'Vue', 'Nuxt', 'Unity'] },
  { label: { de: 'testen', en: 'testing' }, items: ['xUnit', 'bUnit', 'Vitest', 'Playwright'] },
  { label: { de: 'werkzeuge', en: 'tools' }, items: ['Git', 'GitHub', 'Docker', 'MySQL', 'IntelliJ IDEA', 'UML'] },
  { label: { de: 'ki-werkzeuge', en: 'ai tools' }, items: ['Claude Code', 'Codex', 'Ollama'] },
]
