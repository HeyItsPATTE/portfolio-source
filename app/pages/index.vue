<script setup lang="ts">
import { facts } from '~/data/facts'
import { cvMailto, mailto, profile } from '~/data/profile'
import { projects } from '~/data/projects'
import { stack } from '~/data/stack'
import { timeline } from '~/data/timeline'

const { t } = useI18n()
const { l, locale } = useLocalized()
const localePath = useLocalePath()

usePageMeta('home')

const featured = computed(() => projects.filter((p) => p.featured))
const factItems = computed(() => facts.map((f) => ({ label: l(f.label), value: l(f.value) })))
const stackGroups = computed(() => stack.map((g) => ({ label: l(g.label), items: g.items })))
const homeTimeline = computed(() => timeline.filter((e) => e.onHome))
</script>

<template>
  <div class="home page page-frame">
    <section class="hero reveal" style="--i: 0">
      <div class="hero__id">
        <img class="hero__avatar" :src="profile.avatar" alt="" width="72" height="72">
        <div>
          <p class="hero__name">{{ profile.name }}</p>
          <p class="hero__idline">{{ t('home.idLine') }}</p>
        </div>
      </div>
      <h1 class="hero__title">{{ t('home.heroA') }}<em>{{ t('home.heroEm') }}</em>{{ t('home.heroB') }}</h1>
      <p class="hero__lead">{{ t('home.lead') }}</p>
      <div class="actions">
        <KrButton variant="primary" :href="mailto()">{{ t('contact.emailCta') }}</KrButton>
        <KrButton :to="localePath('/projects')">{{ t('home.ctaProjects') }}</KrButton>
      </div>
    </section>

    <section class="glance reveal" style="--i: 1">
      <h2 class="visually-hidden">{{ t('home.factsLabel') }}</h2>
      <FactList :items="factItems" layout="row" />
    </section>

    <section class="block reveal" style="--i: 2">
      <div class="block__head">
        <KrSectionHeading :eyebrow="t('home.work.eyebrow')" :title="t('home.work.title')" :lead="t('home.work.lead')" />
        <NuxtLink class="kr-link block__more" :to="localePath('/projects')">{{ t('home.work.all') }}</NuxtLink>
      </div>
      <div class="card-grid">
        <KrProjectCard
          v-for="p in featured"
          :key="p.slug"
          :title="p.title"
          :meta="l(p.meta)"
          :summary="l(p.summary)"
          :tags="p.tags"
          :href="p.href"
          :external="!!p.href"
        />
      </div>
    </section>

    <section class="block reveal" style="--i: 3">
      <KrSectionHeading :eyebrow="t('home.stack.eyebrow')" :title="t('home.stack.title')" :lead="t('home.stack.lead')" />
      <StackList :groups="stackGroups" />
    </section>

    <section class="block reveal" style="--i: 4">
      <div class="block__head">
        <KrSectionHeading :eyebrow="t('home.background.eyebrow')" :title="t('home.background.title')" :lead="t('home.background.lead')" />
        <NuxtLink class="kr-link block__more" :to="localePath('/about')">{{ t('home.background.more') }}</NuxtLink>
      </div>
      <div class="timeline">
        <KrTimelineItem
          v-for="e in homeTimeline"
          :key="e.place"
          :period="l(e.period)"
          :title="l(e.title)"
          :place="e.place"
          :text="e.text ? l(e.text) : undefined"
        />
      </div>
    </section>

    <section id="contact" class="contact reveal" style="--i: 5">
      <KrSectionHeading :eyebrow="t('home.contact.eyebrow')" :title="t('home.contact.title')" :lead="t('home.contact.lead')" />
      <div class="actions">
        <KrButton variant="primary" :href="mailto()">{{ t('contact.emailCta') }}</KrButton>
        <KrButton :href="profile.linkedin" external>LinkedIn ↗</KrButton>
        <KrButton variant="ghost" :href="cvMailto(locale)">{{ t('contact.cvCta') }}</KrButton>
      </div>
      <p class="contact__links">
        <a class="kr-link" :href="mailto()">{{ profile.email }}</a>
        <a class="kr-link" :href="profile.github" target="_blank" rel="noopener noreferrer">GitHub ↗</a>
        <span>{{ t('contact.discord') }}</span>
      </p>
    </section>
  </div>
</template>

<style scoped lang="scss">
@use '~/assets/scss/mixins' as *;

.home {
  padding-top: 80px;

  @include phone {
    padding-top: var(--space-12);
  }
}

.hero {
  display: flex;
  flex-direction: column;
  gap: 28px;
  padding-bottom: var(--space-12);
}

.hero__id {
  display: flex;
  align-items: center;
  gap: 20px;
}

.hero__avatar {
  width: 72px;
  height: 72px;
  border: 1px solid var(--line);
  border-radius: var(--radius-full);
  background: var(--surface);
  object-fit: cover;
}

.hero__name {
  color: var(--ink);
  @include type-subheading;
}

.hero__idline {
  margin-top: var(--space-1);
  color: var(--ink-faint);
  @include type-label;
}

.hero__title {
  max-width: 15em;
  color: var(--ink);
  @include type-display;

  em {
    font-style: italic;
  }
}

.hero__lead {
  max-width: var(--width-prose);
  color: var(--ink-muted);
  @include type-lead;
}

.glance {
  margin-bottom: var(--section-gap);
}

.contact {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
  margin-bottom: var(--section-gap);
  padding: clamp(24px, 4vw, 48px);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  background: var(--surface);
  scroll-margin-top: var(--space-6);
}

.contact__links {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0 var(--space-6);
  color: var(--ink-muted);
  @include type-small;

  a {
    display: inline-flex;
    align-items: center;
    min-height: 40px;
  }
}
</style>
