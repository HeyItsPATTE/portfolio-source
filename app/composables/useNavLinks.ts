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
