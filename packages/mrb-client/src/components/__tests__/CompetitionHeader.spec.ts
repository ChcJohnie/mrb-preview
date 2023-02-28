import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'

import CompetitionHeader from '../CompetitionHeader.vue'
import { useSettingStore } from '@/stores/settings'

import type { Competition } from '@/types/competition'

describe('CompetitionHeader', () => {
  const TEST_COMPETITION: Competition = {
    id: 1,
    name: 'Test Competition',
    organizer: 'Test Organizer',
    date: '2023-01-01',
    timediff: 0,
    categories: [],
  }

  it('renders properly', () => {
    const wrapper = mount(CompetitionHeader, {
      props: { competition: TEST_COMPETITION },
      global: {
        stubs: { RouterLink: true },
        plugins: [createTestingPinia()],
      },
    })

    expect(wrapper.text()).toContain(TEST_COMPETITION.name)
  })

  it('renders current time formatted in hh:mm:ss and updates it each second', () => {
    vi.useFakeTimers()
    const wrapper = mount(CompetitionHeader, {
      props: { competition: TEST_COMPETITION },
      global: {
        stubs: { RouterLink: true },
        plugins: [createTestingPinia()],
      },
    })

    const time = wrapper.find('[data-test="current-time"]')
    expect(time.text()).toMatch(/^\d\d:\d\d:\d\d$/)
    // TODO Find way to check time gets updated each second
  })

  it('renders home and setting (cog-icon) button', async () => {
    const wrapper = mount(CompetitionHeader, {
      props: { competition: TEST_COMPETITION },
      global: {
        stubs: { RouterLink: true },
        plugins: [createTestingPinia()],
      },
    })
    const store = useSettingStore()

    wrapper.get('[data-test="home-button"]')

    const settingsButton = wrapper.get('[data-test="settings-button"]')
    await settingsButton.trigger('click')
    expect(store.setSettingsDisplayed).toHaveBeenCalled()
  })
})
