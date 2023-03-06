import { render, fireEvent } from '@testing-library/vue'
import { createRouter, createWebHistory, type Router } from 'vue-router'

import CompetitionSublist from '../CompetitionSublist.vue'
import { DEFAULT_TEST_SIMPLE_COMPETITION } from '@/composables/providers/useMockData'

const TEST_COMPETITIONS_3_ITEMS = new Array(3).fill({}).map((_, i) => ({
  ...DEFAULT_TEST_SIMPLE_COMPETITION,
  id: i + 1,
  name: `TEST_EVENT ${i}`,
}))
const TEST_COMPETITIONS_20_ITEMS = new Array(20).fill({}).map((_, i) => ({
  ...DEFAULT_TEST_SIMPLE_COMPETITION,
  id: i + 1,
  name: `TEST_EVENT ${i}`,
}))

let router: Router
beforeEach(async () => {
  router = createRouter({
    history: createWebHistory(),
    routes: [
      { path: '/', name: 'home', component: { template: '<span></span>' } },
      {
        path: '/event/:competitionId?',
        name: 'event',
        // route level code-splitting
        // this generates a separate chunk (About.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import('@/views/CompetitionView.vue'),
      },
    ],
  })

  router.push('/')
  await router.isReady()
})

describe('CompetitionSublist', () => {
  it('should render competitions', () => {
    const { getAllByTestId, getAllByRole, getByText } = render(
      CompetitionSublist,
      {
        props: { competitions: TEST_COMPETITIONS_3_ITEMS },
        global: {
          plugins: [router],
        },
        slots: {
          default: 'TEST LIST',
        },
      }
    )

    expect(getAllByTestId('competition-link')).toHaveLength(3)
    expect(getAllByRole('listitem')).toHaveLength(3)
    expect(getAllByRole('link')).toHaveLength(3)

    const oneEventLink = getByText(TEST_COMPETITIONS_3_ITEMS[0].name, {
      exact: false,
    })
    expect(oneEventLink).toHaveAttribute('href', '/event/1')

    getByText('TEST LIST')
    expect(() => getByText(/\d+. \d+. \d+/)).toThrow()
  })

  it('can show date in list item', () => {
    const { getByText, getAllByText } = render(CompetitionSublist, {
      props: { competitions: TEST_COMPETITIONS_3_ITEMS, showDate: true },
      global: {
        plugins: [router],
      },
      slots: {
        default: 'TEST LIST',
      },
    })

    getByText('TEST LIST')
    getAllByText(/\d+. \d+. \d+/)
  })

  it('should render competitions with pagination', async () => {
    const { getAllByTestId, getByRole } = render(CompetitionSublist, {
      props: { competitions: TEST_COMPETITIONS_20_ITEMS, isPaginated: true },
      global: {
        plugins: [router],
      },
      slots: {
        default: 'TEST LIST',
      },
    })

    expect(getAllByTestId('competition-link')).toHaveLength(5)
    const moreButton = getByRole('button', { name: 'Show more' })
    const fullButton = getByRole('button', { name: 'Show full' })

    await fireEvent.click(moreButton)
    expect(getAllByTestId('competition-link')).toHaveLength(10)

    await fireEvent.click(fullButton)
    expect(getAllByTestId('competition-link')).toHaveLength(20)

    expect(() => getByRole('button', { name: 'Show more' })).toThrow()
    expect(() => getByRole('button', { name: 'Show full' })).toThrow()
  })
})
