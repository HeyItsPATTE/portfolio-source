<script setup lang="ts">
import { computed, resolveComponent } from 'vue'

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost'
    size?: 'md' | 'sm'
    href?: string
    /** A path on this site, e.g. from localePath(); rendered with NuxtLink. */
    to?: string
    external?: boolean
    type?: 'button' | 'submit'
  }>(),
  { variant: 'secondary', size: 'md', type: 'button' },
)

const NuxtLink = resolveComponent('NuxtLink')
const classes = computed(() => ['kr-btn', `kr-btn--${props.variant}`, { 'kr-btn--sm': props.size === 'sm' }])
const newTab = computed(() => (props.external ? { target: '_blank', rel: 'noopener noreferrer' } : {}))
</script>

<template>
  <component :is="NuxtLink" v-if="to" :to="to" :class="classes"><slot /></component>
  <a v-else-if="href" :href="href" :class="classes" v-bind="newTab"><slot /></a>
  <button v-else :type="type" :class="classes"><slot /></button>
</template>
