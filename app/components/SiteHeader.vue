<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const { links } = useNavLinks()
</script>

<template>
  <div class="site-header">
    <header class="kr-header page-frame">
      <NuxtLink class="kr-header__name" :to="localePath('/')">Patrick Kraft</NuxtLink>
      <nav class="kr-header__nav" :aria-label="t('nav.label')">
        <ul>
          <li v-for="link in links" :key="link.key">
            <NuxtLink v-slot="{ href, navigate }" :to="link.to" custom>
              <a :href="href" :aria-current="link.current ? 'page' : undefined" @click="navigate">{{ link.label }}</a>
            </NuxtLink>
          </li>
        </ul>
      </nav>
      <div class="kr-header__end">
        <LangSwitch />
        <ThemeToggle />
      </div>
      <MobileMenu />
    </header>
  </div>
</template>

<style scoped lang="scss">
.site-header {
  border-bottom: 1px solid var(--line);
  background: var(--bg);
}
</style>
