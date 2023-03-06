import { render, within } from '@testing-library/vue'
import { addDays, subDays } from 'date-fns'
import { createRouter, createWebHistory, type Router } from 'vue-router'

import CompetitionList from '../CompetitionList.vue'
import { DEFAULT_TEST_SIMPLE_COMPETITION } from '@/composables/providers/useMockData'
import { useMockData } from '@/composables/providers/useMockData'
import { useDataProviderKey } from '@/types/providers'

const today = new Date()
const TEST_COMPETITION = [
  { ...DEFAULT_TEST_SIMPLE_COMPETITION, date: today, id: 1 },
  {
    ...DEFAULT_TEST_SIMPLE_COMPETITION,
    date: addDays(today, 1),
    id: 2,
  },
  {
    ...DEFAULT_TEST_SIMPLE_COMPETITION,
    date: subDays(today, 1),
    id: 3,
  },
]

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

describe('CompetitionList', () => {
  it('should render competitions and classify them into correct sublists', () => {
    const { getAllByTestId, getByTestId, getByText } = render(CompetitionList, {
      global: {
        plugins: [router],
        provide: {
          [useDataProviderKey as symbol]: () =>
            useMockData({ MOCK_COMPETION_LIST: TEST_COMPETITION }),
        },
      },
    })

    expect(getAllByTestId('competition-link')).toHaveLength(3)

    const todayCompetitions = getByTestId('competitions-today')
    expect(
      within(todayCompetitions).getAllByTestId('competition-link')
    ).toHaveLength(1)
    const futureCompetitions = getByTestId('competitions-future')
    expect(
      within(futureCompetitions).getAllByTestId('competition-link')
    ).toHaveLength(1)
    const pastCompetitions = getByTestId('competitions-past')
    expect(
      within(pastCompetitions).getAllByTestId('competition-link')
    ).toHaveLength(1)

    getByText('Competition list', { exact: false })
    getByText('today', { exact: false })
    getByText('upcoming', { exact: false })
    getByText('past', { exact: false })
  })
})
