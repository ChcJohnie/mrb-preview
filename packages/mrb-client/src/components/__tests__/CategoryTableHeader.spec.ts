import { mount } from '@vue/test-utils'

import CategoryTableHeader from '../CategoryTableHeader.vue'
import type { Category } from '@/types/category'

describe('CategoryTableHeader', () => {
  const TEST_CATEGORY: Category = {
    id: 1,
    name: 'Test Category',
    gender: 'X',
  }

  const TEST_COUNTS = {
    finished: 122,
    undefined: 13,
    full: 135,
  }

  it('renders properly', async () => {
    const categoryWithDetails: Category = {
      ...TEST_CATEGORY,
      length: 2.2,
      climb: 100,
      controls: 21,
    }

    const wrapper = mount(CategoryTableHeader, {
      props: { category: TEST_CATEGORY, athletesCount: TEST_COUNTS },
    })

    expect(wrapper.text()).toContain(TEST_CATEGORY.name)
    expect(wrapper.text()).toContain(TEST_COUNTS.finished)
    expect(wrapper.text()).toContain(TEST_COUNTS.full)
    expect(wrapper.text()).not.toContain('km')
    expect(wrapper.text()).not.toContain(categoryWithDetails.controls)

    await wrapper.setProps({ category: categoryWithDetails })
    expect(wrapper.text()).toContain('km')
    expect(wrapper.text()).toContain(categoryWithDetails.controls)
  })

  it('sets element background based on category gender', async () => {
    const wrapper = mount(CategoryTableHeader, {
      props: { category: TEST_CATEGORY, athletesCount: TEST_COUNTS },
    })

    expect(wrapper.classes()).toContain('bg-neutral')

    const womenCategory: Category = {
      ...TEST_CATEGORY,
      gender: 'F',
    }
    await wrapper.setProps({ category: womenCategory })
    expect(wrapper.classes()).toContain('bg-female')
  })
})
