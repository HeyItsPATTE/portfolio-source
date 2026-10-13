<script setup lang="ts">
withDefaults(
  defineProps<{
    period: string
    title: string
    place?: string
    text?: string
    as?: 'h3' | 'h4'
  }>(),
  { as: 'h3' },
)
</script>

<template>
  <div class="kr-timeline-item">
    <p class="kr-timeline-item__period">{{ period }}</p>
    <div class="kr-timeline-item__main">
      <component :is="as" class="kr-timeline-item__title">{{ title }}</component>
      <p v-if="place" class="kr-timeline-item__place">{{ place }}</p>
      <div v-if="text || $slots.default" class="kr-timeline-item__text">
        <slot><p>{{ text }}</p></slot>
      </div>
    </div>
  </div>
</template>
