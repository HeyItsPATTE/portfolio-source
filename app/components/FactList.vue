<script setup lang="ts">
withDefaults(
  defineProps<{
    items: { label: string; value: string; href?: string }[]
    layout?: 'row' | 'stack'
  }>(),
  { layout: 'row' },
)
</script>

<template>
  <dl class="fact-list" :class="`fact-list--${layout}`">
    <div v-for="item in items" :key="item.label" class="fact-list__item">
      <dt class="fact-list__label">{{ item.label }}</dt>
      <dd class="fact-list__value">
        <a v-if="item.href" class="kr-link" :href="item.href">{{ item.value }}</a>
        <template v-else>{{ item.value }}</template>
      </dd>
    </div>
  </dl>
</template>

<style scoped lang="scss">
@use '~/assets/scss/mixins' as *;

.fact-list__item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.fact-list__label {
  color: var(--ink-faint);
  @include type-label;
}

.fact-list--row {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 190px), 1fr));
  column-gap: var(--space-8);
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);

  .fact-list__item {
    padding: 20px 0;
  }

  .fact-list__value {
    color: var(--ink);
    font-size: 15px;
    line-height: 22px;
  }
}

.fact-list--stack {
  display: flex;
  flex-direction: column;
  gap: 20px;

  .fact-list__value {
    color: var(--ink-muted);
    @include type-small;
  }
}
</style>
