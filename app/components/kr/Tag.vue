<script setup lang="ts">
withDefaults(defineProps<{ tone?: 'neutral' | 'lamp' }>(), { tone: 'neutral' })
</script>

<template>
  <span class="kr-tag" :class="{ 'kr-tag--lamp': tone === 'lamp' }"><slot /></span>
</template>
