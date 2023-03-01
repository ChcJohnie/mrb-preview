import { render } from '@testing-library/vue'

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
    const { container, getByText } = render(CategoryTableFinishedRow, {
      props: { isEven: false, data: TEST_RUNNER },
    })

    getByText(TEST_RUNNER.rank + '.')
    getByText(TEST_RUNNER.surname)
    getByText(TEST_RUNNER.club)
    getByText(TEST_RUNNER.time!)
    getByText('+ ' + TEST_RUNNER.loss)
    expect(container.firstChild).toHaveClass('bg-white')
    expect(container.firstChild).not.toHaveClass('bg-even')
  })

  it('renders properly for even rows', async () => {
    const { container } = render(CategoryTableFinishedRow, {
      props: { isEven: true, data: TEST_RUNNER },
    })
    expect(container.firstChild).toHaveClass('bg-even')
  })

  it('renders properly for runners with no loss', async () => {
    const runner: RunnerWithStats = {
      ...TEST_RUNNER,
      loss: '',
    }

    const { queryByText } = render(CategoryTableFinishedRow, {
      props: { isEven: false, data: runner },
    })
    expect(queryByText('+ ' + TEST_RUNNER.loss)).toBeFalsy()
  })

  it('renders properly for not ok runner', async () => {
    const runner: RunnerWithStats = {
      ...TEST_RUNNER,
      status: RunnerStatus.Disqualified,
      rank: 0,
    }

    const { getByText } = render(CategoryTableFinishedRow, {
      props: { isEven: false, data: runner },
    })
    expect(() => getByText(runner.rank + '.')).toThrow()
    getByText(RunnerStatus[runner.status])
    expect(() => getByText(runner.time!)).toThrow()
  })
})
