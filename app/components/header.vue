<template>
  <div class="header">
    <ul class="header-links">
      <li class="header-links-item">
        <h3 class="header-links-item-text">
            HOME
        </h3>
      </li>
      <li class="header-links-item">
        <h3 class="header-links-item-text">
            PROJECTS
        </h3>
      </li>
      <li class="header-links-item">
        <h3 class="header-links-item-text">
            ABOUT
        </h3>
      </li>
      <li class="header-links-item">
        <h3 class="header-links-item-text">
            CONTACT
        </h3>
      </li>
    </ul>

  </div>
</template>

<script setup lang="ts">

</script>

<style lang="scss" scoped>
@use '~/assets/scss/variables' as *;

.header {
  Display: flex;
  justify-content: center;
  width: 100vw;
  height: 5vh;
  background-color: $color-primary;

  &-links {
    Display: flex;
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    width: 30%;
    height: 100%;
  }
}
</style>