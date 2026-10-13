<script setup lang="ts">
import { datenschutz } from '~/data/legal'

const { t } = useI18n()
usePageMeta('datenschutz')
</script>

<template>
  <LegalPage :title="t('meta.datenschutz.title')" :sections="datenschutz" />
</template>
