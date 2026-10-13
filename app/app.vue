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
