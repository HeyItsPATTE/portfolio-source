<script setup lang="ts">
import { LEGAL_UPDATED, type LegalSection } from '~/data/legal'

defineProps<{ title: string; sections: LegalSection[] }>()
const { t, locale } = useI18n()
</script>

<template>
  <div class="page page-frame">
    <section class="block">
      <KrSectionHeading as="h1" :title="title" :lead="locale === 'de' ? undefined : t('legal.germanOnly')" />
      <div class="legal prose" lang="de">
        <section v-for="section in sections" :key="section.heading" class="legal__section">
          <h2 class="legal__heading">{{ section.heading }}</h2>
          <p v-for="(paragraph, i) in section.paragraphs" :key="i" class="legal__paragraph">{{ paragraph }}</p>
          <ul v-if="section.links?.length" class="legal__links">
            <li v-for="link in section.links" :key="link.href">
              <a
                class="kr-link"
                :href="link.href"
                :target="link.external ? '_blank' : undefined"
                :rel="link.external ? 'noopener noreferrer' : undefined"
              >{{ link.label }}<template v-if="link.external"> ↗</template></a>
            </li>
          </ul>
        </section>
        <p class="legal__updated">{{ t('legal.updated', { date: LEGAL_UPDATED }) }}</p>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
@use '~/assets/scss/mixins' as *;

.legal {
  gap: var(--space-8);
}

.legal__section {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.legal__heading {
  color: var(--ink);
  @include type-subheading;
}

.legal__paragraph {
  white-space: pre-line;
}

.legal__links {
  display: flex;
  flex-direction: column;

  a {
    display: inline-flex;
    align-items: center;
    min-height: 40px;
  }
}

.legal__updated {
  color: var(--ink-faint);
  @include type-label;
}
</style>
