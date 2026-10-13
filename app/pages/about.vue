<script setup lang="ts">
import { cvMailto, profile } from '~/data/profile'
import { timeline } from '~/data/timeline'
import type { TimelineEntry } from '~/data/types'

const { t } = useI18n()
const { l, locale } = useLocalized()
const localePath = useLocalePath()

usePageMeta('about')

const work = computed(() => timeline.filter((e) => e.kind === 'work'))
const education = computed(() => timeline.filter((e) => e.kind === 'education'))
const facts = computed(() => [
  { label: t('about.facts.based'), value: t('about.values.based') },
  { label: t('about.facts.languages'), value: t('about.values.languages') },
  { label: t('about.facts.outside'), value: t('about.values.outside') },
  { label: t('about.facts.cv'), value: t('about.values.cv'), href: cvMailto(locale.value) },
])

function entryText(entry: TimelineEntry): string | undefined {
  const text = entry.textLong ?? entry.text
  return text ? l(text) : undefined
}
</script>

<template>
  <div class="page page-frame">
    <section class="block intro reveal">
      <div class="intro__text">
        <KrSectionHeading as="h1" :eyebrow="t('about.eyebrow')" :lead="t('about.lead')">
          <template #title>{{ t('about.titleA') }}<em>{{ t('about.titleEm') }}</em></template>
        </KrSectionHeading>
        <div class="prose">
          <p>{{ t('about.p1') }}</p>
          <p>{{ t('about.p2') }}</p>
          <p>{{ t('about.p3') }}</p>
        </div>
      </div>
      <div class="intro__side">
        <img class="intro__portrait" :src="profile.portrait" :alt="t('portrait.alt')" width="720" height="720">
        <h2 class="visually-hidden">{{ t('about.factsLabel') }}</h2>
        <FactList :items="facts" layout="stack" />
      </div>
    </section>

    <section class="block reveal" style="--i: 1">
      <KrSectionHeading :eyebrow="t('about.work.eyebrow')" :title="t('about.work.title')" />
      <div class="timeline">
        <KrTimelineItem
          v-for="e in work"
          :key="e.place + e.period.de"
          :period="l(e.period)"
          :title="l(e.title)"
          :place="e.place"
          :text="entryText(e)"
        />
      </div>
    </section>

    <section class="block reveal" style="--i: 2">
      <KrSectionHeading :eyebrow="t('about.education.eyebrow')" :title="t('about.education.title')" />
      <div class="timeline">
        <KrTimelineItem
          v-for="e in education"
          :key="e.place + e.period.de"
          :period="l(e.period)"
          :title="l(e.title)"
          :place="e.place"
          :text="entryText(e)"
        />
      </div>
      <div class="actions">
        <KrButton variant="primary" :href="cvMailto(locale)">{{ t('contact.cvCta') }}</KrButton>
        <KrButton :to="localePath('/projects')">{{ t('about.ctaProjects') }}</KrButton>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.intro {
  flex-direction: row;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: var(--space-12) 80px;
}

.intro__text {
  display: flex;
  flex: 999 1 480px;
  flex-direction: column;
  gap: var(--space-6);
  min-width: 0;
  max-width: var(--width-prose);
}

.intro__side {
  display: flex;
  flex: 1 1 280px;
  flex-direction: column;
  gap: var(--space-8);
  max-width: 360px;
}

.intro__portrait {
  width: 100%;
  aspect-ratio: 1 / 1;
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  background: var(--surface);
  object-fit: cover;
}
</style>
