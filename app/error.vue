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
