<script setup lang="ts">
import { impressum } from '~/data/legal'

const { t } = useI18n()
usePageMeta('impressum')
</script>

<template>
  <LegalPage :title="t('meta.impressum.title')" :sections="impressum" />
</template>
