import { defineComponent } from 'vue'
import { addDays, subDays } from 'date-fns'
import { render } from '@testing-library/vue'

import { useCompetitions } from '../useCompetitions'
import { DEFAULT_TEST_SIMPLE_COMPETITION } from '../providers/useMockData'
import { useMockData } from '../providers/useMockData'
import { useDataProviderKey } from '@/types/providers'

describe('useCompetitions', () => {
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

  describe('useAthletes', () => {
    /*
      Test useAthletes with official useTestMocks data provider
      All other providers should adhere for same API (and optionally be tested E2E)
    */
    let result: ReturnType<typeof useCompetitions>

    const getTestComponent = () =>
      defineComponent({
        template: '<span></span>',
        setup: () => {
          result = useCompetitions()
          return {}
        },
      })

    it('it should return empty fields and not available when no athletes passed', () => {
      render(getTestComponent(), {
        global: {
          provide: {
            [useDataProviderKey as symbol]: () =>
              useMockData({ MOCK_COMPETION_LIST: [] }),
          },
        },
      })

      expect(result.status.value).toEqual('success')
      expect(result.competitions.value).toEqual([])
    })

    it('should return competitions', () => {
      render(getTestComponent(), {
        global: {
          provide: {
            [useDataProviderKey as symbol]: () =>
              useMockData({ MOCK_COMPETION_LIST: TEST_COMPETITION }),
          },
        },
      })

      expect(result.status.value).toEqual('success')
      expect(result.competitions.value?.length).toEqual(3)
      expect(result.competitions.value).toEqual(TEST_COMPETITION)
    })

    it('should return competitions classified by period', () => {
      render(getTestComponent(), {
        global: {
          provide: {
            [useDataProviderKey as symbol]: () =>
              useMockData({ MOCK_COMPETION_LIST: TEST_COMPETITION }),
          },
        },
      })

      expect(result.status.value).toEqual('success')
      expect(result.competitions.value?.length).toEqual(3)
      expect(result.competitionsByPeriod.value.today.length).toEqual(1)
      expect(result.competitionsByPeriod.value.today[0].id).toEqual(1)
      expect(result.competitionsByPeriod.value.future.length).toEqual(1)
      expect(result.competitionsByPeriod.value.future[0].id).toEqual(2)
      expect(result.competitionsByPeriod.value.past.length).toEqual(1)
      expect(result.competitionsByPeriod.value.past[0].id).toEqual(3)
    })
  })
})
