import { ref, defineComponent } from 'vue'
import { render, cleanup, waitFor } from '@testing-library/vue'
import { rest } from 'msw'
import { mockServer } from '../../../../test/mock-server'
import { VUE_QUERY_CLIENT, QueryClient } from '@tanstack/vue-query'

import { useLiveResultat } from '../useLiveResultat'
import type { Competition, CompetitionList } from '@/types/competition'
import { RunnerStatus } from '@/types/category'

const TEST_COMPETITION: Competition = {
  id: 1,
  name: 'TEST EVENT',
  organizer: 'TEST CLUB',
  date: new Date('2023-01-01'),
  timediff: 0,
  categories: [
    {
      id: 1,
      name: 'TEST CATEGORY',
      gender: 'X',
      runners: [],
    },
  ],
}

const TEST_RESP_COMPETITIONS = {
  competitions: [
    {
      id: 1,
      name: 'TEST EVENT 1',
      organizer: 'TEST CLUB',
      date: new Date('2023-01-01'),
      timediff: 0,
    },
    {
      id: 2,
      name: 'TEST EVENT 2',
      organizer: 'TEST CLUB',
      date: new Date('2023-01-02'),
      timediff: 0,
    },
    {
      id: 3,
      name: 'TEST EVENT 3',
      organizer: 'TEST CLUB',
      date: new Date('2023-01-03'),
      timediff: 0,
    },
  ],
}

const TEST_COMPETITIONS_PARSED: CompetitionList = [
  {
    id: 1,
    name: 'TEST EVENT 1',
    organizer: 'TEST CLUB',
    date: new Date('2023-01-01'),
    timediff: 0,
  },
]

const TEST_RESP_ATHELETES = {
  status: 'OK',
  className: 'TEST',
  splitcontrols: [],
  results: [
    {
      place: '1',
      name: 'TestRunner1',
      club: 'OK Club',
      result: '72000',
      status: 0,
      timeplus: '0',
      progress: 100,
      start: 0,
    },
    {
      place: '2',
      name: 'TestRunner2',
      club: 'OK Club',
      result: '78000',
      status: 0,
      timeplus: '6000',
      progress: 100,
      start: 12000,
    },
    {
      place: '3',
      name: 'TestRunner3',
      club: 'OK Club',
      result: '84000',
      status: 0,
      timeplus: '12000',
      progress: 100,
      start: 24000,
    },
  ],
  hash: 'testhash',
}

function setupMockServer({
  athletesResp = TEST_RESP_ATHELETES,
  competitionsResp = TEST_RESP_COMPETITIONS,
} = {}) {
  mockServer.use(
    rest.get('https://liveresultat.orientering.se/api.php', (req, res, ctx) => {
      if (
        req.url.searchParams.get('method') === 'getclassresults' &&
        athletesResp
      )
        return res.once(ctx.json(athletesResp))
      if (
        req.url.searchParams.get('method') === 'getcompetitions' &&
        competitionsResp
      )
        return res.once(ctx.json(competitionsResp))
      throw new Error('Unhandled request')
    })
  )
}

afterEach(cleanup)

type UseLiveResultat = ReturnType<typeof useLiveResultat>

let competitionsComposable: ReturnType<UseLiveResultat['getCompetitionsLoader']>
const getTestCompetitionsComponent = () =>
  defineComponent({
    template: '<div />',
    setup() {
      const { getCompetitionsLoader } = useLiveResultat()
      competitionsComposable = getCompetitionsLoader()
      return { competitionsComposable }
    },
  })

let athletesComposable: ReturnType<UseLiveResultat['getAthletesLoader']>
const getTestAthletesComponent = ({
  competition,
  category,
  fetchEnabled,
}: Parameters<UseLiveResultat['getAthletesLoader']>[0]) =>
  defineComponent({
    template: '<div />',
    setup() {
      const { getAthletesLoader } = useLiveResultat()
      athletesComposable = getAthletesLoader({
        competition,
        category,
        fetchEnabled,
      })
      return { athletesComposable }
    },
  })

describe('useLiveResultat', () => {
  describe('getCompetitionsLoader', () => {
    it('getCompetitionsLoader should return competitions in common format', async () => {
      setupMockServer()
      render(getTestCompetitionsComponent(), {
        global: {
          provide: {
            [VUE_QUERY_CLIENT]: new QueryClient({
              defaultOptions: {
                queries: {
                  retry: false,
                },
              },
            }),
          },
        },
      })

      const { competitions, status } = competitionsComposable
      await waitFor(() => expect(status.value).toEqual('success'))
      expect(competitions.value?.length).toEqual(3)
      expect(competitions.value?.[0]).toEqual(TEST_COMPETITIONS_PARSED[0])
    })
  })

  describe('getAthletesLoader', () => {
    it('getAthletesLoader should return athletes in common format', async () => {
      setupMockServer()
      render(
        getTestAthletesComponent({
          competition: TEST_COMPETITION,
          category: TEST_COMPETITION.categories[0],
          fetchEnabled: ref(true),
        }),
        {
          global: {
            provide: {
              [VUE_QUERY_CLIENT]: new QueryClient({
                defaultOptions: {
                  queries: {
                    retry: false,
                  },
                },
              }),
            },
          },
        }
      )
      const { rawRunners, status } = athletesComposable
      await waitFor(() => expect(status.value).toEqual('success'))
      expect(rawRunners.value?.length).toEqual(3)
      expect(rawRunners.value?.[0]).toEqual({
        surname: 'TestRunner1',
        firstName: '',
        club: 'OK Club',
        timeM: 12,
        timeS: 0,
        startTime: 1672527600000,
        status: RunnerStatus.Ok,
      })
      expect(rawRunners.value?.[1]).toEqual({
        surname: 'TestRunner2',
        firstName: '',
        club: 'OK Club',
        timeM: 13,
        timeS: 0,
        startTime: 1672527720000,
        status: RunnerStatus.Ok,
      })
      expect(rawRunners.value?.[2]).toEqual({
        surname: 'TestRunner3',
        firstName: '',
        club: 'OK Club',
        timeM: 14,
        timeS: 0,
        startTime: 1672527840000,
        status: RunnerStatus.Ok,
      })
    })
  })
})
