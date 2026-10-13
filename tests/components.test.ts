import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import KrButton from '../app/components/kr/Button.vue'
import KrProjectCard from '../app/components/kr/ProjectCard.vue'
import KrSectionHeading from '../app/components/kr/SectionHeading.vue'
import KrTag from '../app/components/kr/Tag.vue'
import KrTimelineItem from '../app/components/kr/TimelineItem.vue'

// Stands in for Nuxt's <NuxtLink>, which only exists inside a Nuxt app.
const NuxtLink = defineComponent({
  props: { to: { type: [String, Object], required: true } },
  setup(props, { slots }) {
    return () => h('a', { href: String(props.to), 'data-test': 'nuxt-link' }, slots.default?.())
  },
})
const global = { components: { NuxtLink } }

describe('KrButton', () => {
  it('is a secondary <button type="button"> by default', () => {
    const wrapper = mount(KrButton, { slots: { default: 'Save' }, global })
    expect(wrapper.element.tagName).toBe('BUTTON')
    expect(wrapper.attributes('type')).toBe('button')
    expect(wrapper.classes()).toEqual(['kr-btn', 'kr-btn--secondary'])
    expect(wrapper.text()).toBe('Save')
  })

  it('renders an <a> for href and opens external links in a new tab', () => {
    const wrapper = mount(KrButton, {
      props: { href: 'https://example.com', external: true, variant: 'primary' },
      slots: { default: 'Go' },
      global,
    })
    expect(wrapper.element.tagName).toBe('A')
    expect(wrapper.attributes()).toMatchObject({ href: 'https://example.com', target: '_blank', rel: 'noopener noreferrer' })
    expect(wrapper.classes()).toContain('kr-btn--primary')
  })

  it('keeps mailto links in the same tab', () => {
    const wrapper = mount(KrButton, { props: { href: 'mailto:a@b.c' }, slots: { default: 'Mail' }, global })
    expect(wrapper.attributes('target')).toBeUndefined()
  })

  it('uses NuxtLink for routes on this site', () => {
    const wrapper = mount(KrButton, { props: { to: '/projects' }, slots: { default: 'Projects' }, global })
    expect(wrapper.attributes('data-test')).toBe('nuxt-link')
    expect(wrapper.attributes('href')).toBe('/projects')
    expect(wrapper.classes()).toContain('kr-btn')
  })

  it('adds the small modifier and passes listeners through', async () => {
    let clicks = 0
    const wrapper = mount(KrButton, { props: { size: 'sm', variant: 'ghost' }, attrs: { onClick: () => clicks++ }, global })
    expect(wrapper.classes()).toEqual(['kr-btn', 'kr-btn--ghost', 'kr-btn--sm'])
    await wrapper.trigger('click')
    expect(clicks).toBe(1)
  })
})

describe('KrTag', () => {
  it('is neutral by default and tinted with tone="lamp"', () => {
    expect(mount(KrTag, { slots: { default: 'Vue' } }).classes()).toEqual(['kr-tag'])
    expect(mount(KrTag, { props: { tone: 'lamp' } }).classes()).toEqual(['kr-tag', 'kr-tag--lamp'])
  })
})

describe('KrSectionHeading', () => {
  it('renders eyebrow, an h2 title and the lead', () => {
    const wrapper = mount(KrSectionHeading, { props: { eyebrow: '01 · work', title: 'Work', lead: 'What I built.' } })
    expect(wrapper.find('.kr-eyebrow').text()).toBe('01 · work')
    expect(wrapper.find('h2.kr-section-heading__title').text()).toBe('Work')
    expect(wrapper.find('.kr-section-heading__lead').text()).toBe('What I built.')
    expect(wrapper.classes()).not.toContain('kr-section-heading--page')
  })

  it('becomes a page title with as="h1" and leaves out empty parts', () => {
    const wrapper = mount(KrSectionHeading, { props: { as: 'h1', title: 'Projects' } })
    expect(wrapper.find('h1').text()).toBe('Projects')
    expect(wrapper.classes()).toContain('kr-section-heading--page')
    expect(wrapper.find('.kr-eyebrow').exists()).toBe(false)
    expect(wrapper.find('.kr-section-heading__lead').exists()).toBe(false)
  })

  it('takes a rich title through the title slot', () => {
    const wrapper = mount(KrSectionHeading, { slots: { title: () => ['From the cleanroom ', h('em', 'to code')] } })
    expect(wrapper.find('h2 em').text()).toBe('to code')
  })
})

describe('KrProjectCard', () => {
  const base = { title: 'LACNR', meta: 'web · 2026', summary: 'A website.', tags: ['Blazor', 'Vue 3'] }

  it('is an <article> without link or arrow when there is no href', () => {
    const wrapper = mount(KrProjectCard, { props: base })
    expect(wrapper.element.tagName).toBe('ARTICLE')
    expect(wrapper.classes()).not.toContain('kr-card--link')
    expect(wrapper.find('.kr-card__arrow').exists()).toBe(false)
  })

  it('renders title, meta, summary and tags', () => {
    const wrapper = mount(KrProjectCard, { props: base })
    expect(wrapper.find('h3.kr-card__title').text()).toBe('LACNR')
    expect(wrapper.find('.kr-card__meta').text()).toBe('web · 2026')
    expect(wrapper.find('.kr-card__summary').text()).toBe('A website.')
    expect(wrapper.findAll('.kr-tag').map((tag) => tag.text())).toEqual(['Blazor', 'Vue 3'])
  })

  it('is a whole-card link that opens other sites in a new tab with ↗', () => {
    const wrapper = mount(KrProjectCard, { props: { ...base, href: 'https://berrybit.dev', external: true } })
    expect(wrapper.element.tagName).toBe('A')
    expect(wrapper.attributes()).toMatchObject({ href: 'https://berrybit.dev', target: '_blank', rel: 'noopener noreferrer' })
    expect(wrapper.classes()).toContain('kr-card--link')
    expect(wrapper.find('.kr-card__arrow').text()).toBe('↗')
    expect(wrapper.find('.kr-card__arrow').attributes('aria-hidden')).toBe('true')
  })

  it('uses → and stays in the tab for links on this site', () => {
    const wrapper = mount(KrProjectCard, { props: { ...base, href: '/projects' } })
    expect(wrapper.find('.kr-card__arrow').text()).toBe('→')
    expect(wrapper.attributes('target')).toBeUndefined()
  })

  it('leaves out meta, summary and tags when they are missing', () => {
    const wrapper = mount(KrProjectCard, { props: { title: 'Solo' } })
    expect(wrapper.find('.kr-card__meta').exists()).toBe(false)
    expect(wrapper.find('.kr-card__summary').exists()).toBe(false)
    expect(wrapper.find('.kr-card__tags').exists()).toBe(false)
  })
})

describe('KrTimelineItem', () => {
  it('renders period, title, place and text', () => {
    const wrapper = mount(KrTimelineItem, {
      props: { period: '2023–2025', title: 'Bulk production', place: 'CSL Behring GmbH, Marburg', text: 'Ran equipment.' },
    })
    expect(wrapper.find('.kr-timeline-item__period').text()).toBe('2023–2025')
    expect(wrapper.find('h3.kr-timeline-item__title').text()).toBe('Bulk production')
    expect(wrapper.find('.kr-timeline-item__place').text()).toBe('CSL Behring GmbH, Marburg')
    expect(wrapper.find('.kr-timeline-item__text').text()).toBe('Ran equipment.')
  })

  it('leaves out place and text when they are missing', () => {
    const wrapper = mount(KrTimelineItem, { props: { period: '2020–2023', title: 'Service staff' } })
    expect(wrapper.find('.kr-timeline-item__place').exists()).toBe(false)
    expect(wrapper.find('.kr-timeline-item__text').exists()).toBe(false)
  })
})
