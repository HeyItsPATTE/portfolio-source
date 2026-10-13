<script setup lang="ts">
const { t } = useI18n()
const { theme, toggle, syncFromDocument } = useTheme()

onMounted(syncFromDocument)

const label = computed(() => (theme.value === 'night' ? t('theme.toDay') : t('theme.toNight')))
const aria = computed(() => (theme.value === 'night' ? t('theme.ariaToDay') : t('theme.ariaToNight')))
</script>

<template>
  <KrButton variant="ghost" size="sm" :aria-label="aria" @click="toggle">{{ label }}</KrButton>
</template>
