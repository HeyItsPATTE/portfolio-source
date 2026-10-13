import { mount, type VueWrapper } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as vue from 'vue'
import { defineComponent, h } from 'vue'
import MobileMenu from '../app/components/MobileMenu.vue'

// MobileMenu relies on Nuxt auto-imports; outside Nuxt they are plain globals we provide.
const route = vue.reactive({ path: '/projects', fullPath: '/projects' })
const navigate = vi.fn()

const NuxtLink = defineComponent({
  props: { to: { type: [String, Object], required: true }, custom: Boolean },
  setup(props, { slots }) {
    const href = typeof props.to === 'string' ? props.to : `${(props.to as { path: string }).path}${(props.to as { hash?: string }).hash ?? ''}`
    // Same route as now: navigating changes nothing, like vue-router does.
    return () => slots.default?.({ href, navigate })
  },
})
const Stub = (name: string) => defineComponent({ setup: () => () => h('button', { type: 'button' }, name) })

let wrapper: VueWrapper

beforeEach(() => {
  for (const name of ['ref', 'computed', 'watch', 'nextTick', 'onMounted', 'onBeforeUnmount'] as const) vi.stubGlobal(name, vue[name])
  vi.stubGlobal('useI18n', () => ({ t: (key: string) => key }))
  vi.stubGlobal('useRoute', () => route)
  vi.stubGlobal('useNavLinks', () => ({
    links: vue.computed(() => [
      { key: 'projects', label: 'Projects', to: '/projects', current: true },
      { key: 'contact', label: 'Contact', to: { path: '/', hash: '#contact' }, current: false },
    ]),
  }))
  document.body.innerHTML = '<main id="main"><a href="#x">behind</a></main><footer class="site-footer"></footer><div id="app"></div>'
  wrapper = mount(MobileMenu, {
    attachTo: '#app',
    global: { components: { NuxtLink, LangSwitch: Stub('lang'), ThemeToggle: Stub('theme') } },
  })
})

afterEach(() => {
  wrapper.unmount()
  vi.unstubAllGlobals()
  navigate.mockClear()
})

const panel = () => wrapper.find('#mobile-menu-panel')
const trigger = () => wrapper.find('button[aria-controls="mobile-menu-panel"]')
const isOpen = () => trigger().attributes('aria-expanded') === 'true'

describe('MobileMenu', () => {
  it('closes when a link to the current page is tapped', async () => {
    await trigger().trigger('click')
    expect(isOpen()).toBe(true)
    await panel().find('a[href="/projects"]').trigger('click')
    expect(navigate).toHaveBeenCalledTimes(1)
    expect(isOpen()).toBe(false)
    expect(document.documentElement.style.overflow).toBe('')
  })

  it('closes when the contact link is tapped while already on it', async () => {
    await trigger().trigger('click')
    await panel().find('a[href="/#contact"]').trigger('click')
    expect(isOpen()).toBe(false)
  })

  it('makes the page behind the panel inert while open, and restores it', async () => {
    await trigger().trigger('click')
    expect(document.getElementById('main')!.hasAttribute('inert')).toBe(true)
    expect(document.querySelector('.site-footer')!.hasAttribute('inert')).toBe(true)
    await trigger().trigger('click')
    expect(document.getElementById('main')!.hasAttribute('inert')).toBe(false)
    expect(document.querySelector('.site-footer')!.hasAttribute('inert')).toBe(false)
  })

  it('closes on Escape even when focus has fallen to the page body', async () => {
    await trigger().trigger('click')
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await vue.nextTick()
    expect(isOpen()).toBe(false)
    expect(document.activeElement).toBe(trigger().element)
  })
})
