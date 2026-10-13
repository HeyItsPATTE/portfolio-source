<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
// Rendered at build time; useState carries the same year to the client to avoid a hydration mismatch.
const year = useState('footer-year', () => new Date().getFullYear())
</script>

<template>
  <footer class="site-footer">
    <div class="site-footer__inner page-frame">
      <p>{{ t('footer.copyright', { year }) }} · {{ t('footer.built') }}</p>
      <ul class="site-footer__links">
        <li><NuxtLink class="site-footer__link" :to="localePath('/impressum')">{{ t('footer.legal') }}</NuxtLink></li>
        <li><NuxtLink class="site-footer__link" :to="localePath('/datenschutz')">{{ t('footer.privacy') }}</NuxtLink></li>
      </ul>
    </div>
  </footer>
</template>

<style scoped lang="scss">
@use '~/assets/scss/mixins' as *;

.site-footer {
  border-top: 1px solid var(--line);
}

.site-footer__inner {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-4);
  padding-block: var(--space-8) var(--space-12);
  color: var(--ink-faint);
  @include type-small;
}

.site-footer__links {
  display: flex;
  gap: var(--space-4);
}

.site-footer__link {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  color: var(--ink-muted);
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
  text-decoration-color: var(--line-control);
  border-radius: 2px;

  &:hover {
    color: var(--ink);
    text-decoration-color: var(--ink);
  }

  &:focus-visible {
    @include focus-ring;
  }
}
</style>
