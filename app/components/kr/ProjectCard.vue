<script setup lang="ts">
import { computed } from 'vue'
import KrTag from './Tag.vue'

const props = withDefaults(
  defineProps<{
    title: string
    meta?: string
    summary?: string
    tags?: string[]
    href?: string
    external?: boolean
    image?: string
    imageAlt?: string
    as?: 'h2' | 'h3' | 'h4'
  }>(),
  { tags: () => [], imageAlt: '', as: 'h3' },
)

const arrow = computed(() => (props.href ? (props.external ? '↗' : '→') : null))
const root = computed(() => (props.href ? 'a' : 'article'))
const linkAttrs = computed(() => {
  if (!props.href) return {}
  return props.external ? { href: props.href, target: '_blank', rel: 'noopener noreferrer' } : { href: props.href }
})
</script>

<template>
  <component :is="root" class="kr-card" :class="{ 'kr-card--link': !!href }" v-bind="linkAttrs">
    <div v-if="image" class="kr-card__media">
      <img :src="image" :alt="imageAlt" loading="lazy">
    </div>
    <div class="kr-card__body">
      <div v-if="meta || arrow" class="kr-card__meta">
        <span>{{ meta }}</span>
        <span v-if="arrow" class="kr-card__arrow" aria-hidden="true">{{ arrow }}</span>
      </div>
      <component :is="as" class="kr-card__title">{{ title }}</component>
      <p v-if="summary" class="kr-card__summary">{{ summary }}</p>
      <ul v-if="tags.length" class="kr-card__tags">
        <li v-for="tag in tags" :key="tag"><KrTag>{{ tag }}</KrTag></li>
      </ul>
    </div>
  </component>
</template>
