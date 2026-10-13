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
