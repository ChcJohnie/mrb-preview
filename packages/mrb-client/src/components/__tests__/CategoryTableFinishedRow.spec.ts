import { mount } from '@vue/test-utils'

import CategoryTableFinishedRow from '../CategoryTableFinishedRow.vue'
import type { RunnerWithStats } from '@/types/category'
import { RunnerStatus } from '@/types/category'

const TEST_RUNNER: RunnerWithStats = {
  rank: 3,
  surname: 'Test',
  firstName: '',
  club: 'Test Club',
  status: RunnerStatus.Ok,
  time: '12:34',
  loss: '1:23',
  timeM: 12,
  timeS: 34,
}

describe('CategoryTableHeader', () => {
  it('renders properly', async () => {
    const wrapper = mount(CategoryTableFinishedRow, {
      props: { isEven: false, data: TEST_RUNNER },
    })

    expect(wrapper.text()).toContain(TEST_RUNNER.rank + '.')
    expect(wrapper.text()).toContain(TEST_RUNNER.surname)
    expect(wrapper.text()).toContain(TEST_RUNNER.club)
    expect(wrapper.text()).toContain(TEST_RUNNER.time)
    expect(wrapper.text()).toContain('+ ' + TEST_RUNNER.loss)

    expect(wrapper.classes()).not.toContain('bg-even')
  })

  it('renders properly for even rows', async () => {
    const wrapper = mount(CategoryTableFinishedRow, {
      props: { isEven: true, data: TEST_RUNNER },
    })

    expect(wrapper.classes()).toContain('bg-even')
  })

  it('renders properly for runners with no loss', async () => {
    const runner: RunnerWithStats = {
      ...TEST_RUNNER,
      loss: '',
    }

    const wrapper = mount(CategoryTableFinishedRow, {
      props: { isEven: false, data: runner },
    })

    expect(wrapper.text()).not.toContain('+')
  })

  it('renders properly for not ok runner', async () => {
    const runner: RunnerWithStats = {
      ...TEST_RUNNER,
      status: RunnerStatus.Disqualified,
      rank: 0,
    }

    const wrapper = mount(CategoryTableFinishedRow, {
      props: { isEven: false, data: runner },
    })

    expect(wrapper.text()).not.toContain(runner.rank + '.')
    expect(wrapper.text()).toContain(RunnerStatus[runner.status])
    expect(wrapper.text()).not.toContain(runner.time)
  })
})
