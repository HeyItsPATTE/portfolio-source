<script setup lang="ts">
import { swapLocalePath } from '~/utils/locale-path'
import { languageCookie } from '~/utils/root-redirect'

const NAMES = { de: 'Deutsch', en: 'English' } as const

const { locale } = useI18n()
const switchLocalePath = useSwitchLocalePath()
const route = useRoute()
const target = computed(() => (locale.value === 'de' ? 'en' : 'de'))
const routed = computed(() => switchLocalePath(target.value))
// On the 404 page there is no route to switch: load the same path in the other language
// with a full page load, because the error page keeps its locale on client-side navigation.
const fallback = computed(() => (routed.value ? undefined : swapLocalePath(route.path, target.value)))

/** An explicit choice is what the language cookie remembers (read by the "/" redirect). */
function remember() {
  document.cookie = languageCookie(target.value)
}
</script>

<template>
  <KrButton
    variant="ghost"
    size="sm"
    :to="routed || undefined"
    :href="fallback"
    :lang="target"
    :hreflang="target"
    @click="remember"
  >
    {{ NAMES[target] }}
  </KrButton>
</template>
