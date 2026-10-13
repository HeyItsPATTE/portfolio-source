<script setup lang="ts">
const { t } = useI18n()
const { links } = useNavLinks()
const route = useRoute()

const open = ref(false)
const trigger = ref<HTMLButtonElement | null>(null)
const panel = ref<HTMLElement | null>(null)

/** While open, the panel covers the page: lock scrolling and take the page out of the tab order. */
function coverPage(covered: boolean) {
  document.documentElement.style.overflow = covered ? 'hidden' : ''
  for (const el of document.querySelectorAll('#main, .site-footer')) el.toggleAttribute('inert', covered)
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') hide()
}

async function show() {
  open.value = true
  coverPage(true)
  // On document, so Escape still works after a tap on the panel background moved focus to body.
  document.addEventListener('keydown', onKeydown)
  await nextTick()
  panel.value?.querySelector<HTMLElement>('a, button')?.focus()
}

function hide(returnFocus = true) {
  if (!open.value) return
  open.value = false
  coverPage(false)
  document.removeEventListener('keydown', onKeydown)
  if (returnFocus) trigger.value?.focus()
}

/** Close on every link tap: a link to the current page or section doesn't change the route. */
function follow(navigate: (event?: MouseEvent) => unknown, event: MouseEvent) {
  hide(false)
  navigate(event)
}

// Navigating (a link, the language switch) closes the menu without stealing focus.
watch(() => route.fullPath, () => hide(false))

let desktop: MediaQueryList | null = null
const onDesktopChange = (event: MediaQueryListEvent) => {
  if (event.matches) hide(false)
}

onMounted(() => {
  desktop = window.matchMedia('(min-width: 640px)')
  desktop.addEventListener('change', onDesktopChange)
})

onBeforeUnmount(() => {
  desktop?.removeEventListener('change', onDesktopChange)
  document.removeEventListener('keydown', onKeydown)
  coverPage(false)
})
</script>

<template>
  <div class="mobile-menu">
    <button
      ref="trigger"
      type="button"
      class="kr-btn kr-btn--ghost kr-btn--sm"
      aria-controls="mobile-menu-panel"
      :aria-expanded="open ? 'true' : 'false'"
      @click="open ? hide() : show()"
    >
      {{ open ? t('menu.close') : t('menu.open') }}
    </button>
    <div v-show="open" id="mobile-menu-panel" ref="panel" class="mobile-menu__panel">
      <nav :aria-label="t('nav.label')">
        <ul class="mobile-menu__links">
          <li v-for="link in links" :key="link.key">
            <NuxtLink v-slot="{ href, navigate }" :to="link.to" custom>
              <a :href="href" class="mobile-menu__link" :aria-current="link.current ? 'page' : undefined" @click="follow(navigate, $event)">
                {{ link.label }}
              </a>
            </NuxtLink>
          </li>
        </ul>
      </nav>
      <div class="mobile-menu__switches">
        <LangSwitch />
        <ThemeToggle />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '~/assets/scss/mixins' as *;

.mobile-menu {
  display: none;
  margin-left: auto;

  @include phone {
    display: block;
  }
}

.mobile-menu__panel {
  position: fixed;
  inset: calc(var(--header-height) + 1px) 0 0 0;
  z-index: 50;
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
  overflow-y: auto;
  padding: var(--space-6) var(--gutter);
  background: var(--surface-raised);
}

.mobile-menu__link {
  display: flex;
  align-items: center;
  min-height: 48px;
  border-bottom: 1px solid var(--line);
  color: var(--ink);
  text-decoration: none;
  @include type-subheading;

  &[aria-current='page'] {
    color: var(--lamp);
  }

  &:focus-visible {
    @include focus-ring;
  }
}

.mobile-menu__switches {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}
</style>
