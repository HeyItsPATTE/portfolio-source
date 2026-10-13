<script setup lang="ts">
withDefaults(
  defineProps<{
    eyebrow?: string
    title?: string
    lead?: string
    as?: 'h1' | 'h2' | 'h3'
  }>(),
  { as: 'h2' },
)
</script>

<template>
  <div class="kr-section-heading" :class="{ 'kr-section-heading--page': as === 'h1' }">
    <p v-if="eyebrow" class="kr-eyebrow">{{ eyebrow }}</p>
    <component :is="as" class="kr-section-heading__title">
      <slot name="title">{{ title }}</slot>
    </component>
    <p v-if="lead || $slots.default" class="kr-section-heading__lead">
      <slot>{{ lead }}</slot>
    </p>
  </div>
</template>
