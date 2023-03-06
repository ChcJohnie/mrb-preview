import { ref, defineComponent } from 'vue'
import { render, cleanup, waitFor } from '@testing-library/vue'
import { rest } from 'msw'
import { mockServer } from '../../../../test/mock-server'
import { VUE_QUERY_CLIENT, QueryClient } from '@tanstack/vue-query'

import { useLiveResultat } from '../useLiveResultat'
import type { Competition } from '@/types/competition'
import { RunnerStatus } from '@/types/category'

const TEST_COMPETITION: Competition = {
  id: 1,
  name: 'TEST EVENT',
  organizer: 'TEST CLUB',
  date: '2023-01-01',
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

function setupMockServer({ athletesResp = TEST_RESP_ATHELETES } = {}) {
  mockServer.use(
    rest.get('https://liveresultat.orientering.se/api.php', (req, res, ctx) => {
      if (
        req.url.searchParams.get('method') === 'getclassresults' &&
        athletesResp
      )
        return res.once(ctx.json(TEST_RESP_ATHELETES))
      throw new Error('Unhandled request')
    })
  )
}

afterEach(cleanup)

type UseLiveResultat = ReturnType<typeof useLiveResultat>
let composable: ReturnType<UseLiveResultat['getAthletesLoader']>

const getTestAthletesComponent = ({
  competition,
  category,
  fetchEnabled,
}: Parameters<UseLiveResultat['getAthletesLoader']>[0]) =>
  defineComponent({
    template: '<div />',
    setup() {
      const { getAthletesLoader } = useLiveResultat()
      composable = getAthletesLoader({ competition, category, fetchEnabled })
      return { composable }
    },
  })

describe('useLiveResultat', () => {
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
    const { rawRunners, status } = composable
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
