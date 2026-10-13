<script setup lang="ts">
defineProps<{ groups: { label: string; items: string[] }[] }>()
</script>

<template>
  <dl class="stack-list">
    <div v-for="group in groups" :key="group.label" class="stack-list__row">
      <dt class="stack-list__label">{{ group.label }}</dt>
      <dd class="stack-list__items">
        <ul>
          <li v-for="item in group.items" :key="item"><KrTag>{{ item }}</KrTag></li>
        </ul>
      </dd>
    </div>
  </dl>
</template>

<style scoped lang="scss">
@use '~/assets/scss/mixins' as *;

.stack-list {
  border-top: 1px solid var(--line);
}

.stack-list__row {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: var(--space-3) var(--space-6);
  padding: 20px 0;
  border-bottom: 1px solid var(--line);
}

.stack-list__label {
  flex: 0 0 200px;
  color: var(--ink-faint);
  @include type-label;
}

.stack-list__items {
  flex: 1 1 320px;
  min-width: 0;

  ul {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }
}
</style>
