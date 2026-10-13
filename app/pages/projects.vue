<script setup lang="ts">
import { projects } from '~/data/projects'

const { t } = useI18n()
const { l } = useLocalized()

usePageMeta('projects')
</script>

<template>
  <div class="page page-frame">
    <section class="block">
      <KrSectionHeading
        class="reveal"
        as="h1"
        :eyebrow="t('projects.eyebrow')"
        :title="t('projects.title')"
        :lead="t('projects.lead')"
      />
      <div class="card-grid reveal" style="--i: 1">
        <KrProjectCard
          v-for="p in projects"
          :key="p.slug"
          as="h2"
          :title="p.title"
          :meta="l(p.meta)"
          :summary="l(p.summary)"
          :tags="p.tags"
          :href="p.href"
          :external="!!p.href"
        />
      </div>
    </section>
  </div>
</template>
