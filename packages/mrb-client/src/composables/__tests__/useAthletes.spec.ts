import { ref, defineComponent } from 'vue'
import { addMinutes } from 'date-fns'
import { render, waitFor } from '@testing-library/vue'

import {
  useAthletes,
  useFinishedAthletes,
  useUnfinishedAthletes,
} from '../useAthletes'
import type { ClassifyRunners } from '../useAthletes'
import { useMockData } from '../providers/useMockData'
import { useDataProviderKey } from '@/types/providers'
import type { Competition } from '@/types/competition'
import { type RawRunner, RunnerStatus } from '@/types/category'

describe('useAthletes', () => {
  const TestFinishedAthlete: RawRunner = {
    firstName: 'Test',
    surname: 'Athlete',
    club: 'Test Club',
    timeM: 1,
    timeS: 1,
    status: RunnerStatus.Ok,
  }

  const TestUnfinishedAthlete: RawRunner = {
    firstName: 'Test',
    surname: 'Unfinished Athlete',
    club: 'Test Club',
    timeM: 0,
    timeS: 0,
    status: RunnerStatus.Running,
  }

  const TestAthletes = [TestFinishedAthlete, TestUnfinishedAthlete]

  describe('useAthletes', () => {
    /*
      Test useAthletes with official useTestMocks data provider
      All other providers should adhere for same API (and optionally be tested E2E)
    */
    let result: ReturnType<typeof useAthletes>

    const testCompetition: Competition = {
      id: 1,
      name: 'TestComp',
      organizer: 'TestOrg',
      date: new Date(),
      timediff: 0,
      categories: [{ id: 1, name: 'TestCat', gender: 'X' }],
    }

    const fetchEnabled = ref(true)

    const getTestComponent = (testRunners: RawRunner[]) =>
      defineComponent({
        template: '<span></span>',
        setup: () => {
          result = useAthletes({
            competition: testCompetition,
            category: {
              ...testCompetition.categories[0],
              runners: testRunners,
            },
            fetchEnabled,
          })
          return {}
        },
      })

    it('it should return empty fields and not available when no athletes passed', () => {
      render(getTestComponent([]), {
        global: {
          provide: {
            [useDataProviderKey as symbol]: useMockData,
          },
        },
      })

      expect(result.status.value).toEqual('success')
      expect(result.athletes.value.finished).toEqual([])
      expect(result.athletes.value.unfinished).toEqual([])
      expect(result.areAvailable.value).toEqual(false)
    })

    it('is should return empty athletes until fetch is enabled', async () => {
      fetchEnabled.value = false
      render(getTestComponent(TestAthletes), {
        global: {
          provide: {
            [useDataProviderKey as symbol]: useMockData,
          },
        },
      })

      expect(result.status.value).not.toEqual('success')
      expect(result.athletes.value.finished).toEqual([])
      expect(result.athletes.value.unfinished).toEqual([])
      expect(result.areAvailable.value).toEqual(false)

      fetchEnabled.value = true

      await waitFor(() => expect(result.status.value).toEqual('success')) // Wait for reactivity
      expect(result.athletes.value.finished).not.toEqual([])
      expect(result.athletes.value.unfinished).not.toEqual([])
      expect(result.areAvailable.value).toEqual(true)
    })

    it('should return filtered athletes', () => {
      render(getTestComponent(TestAthletes), {
        global: {
          provide: {
            [useDataProviderKey as symbol]: useMockData,
          },
        },
      })

      expect(result.status.value).toEqual('success')
      expect(result.athletes.value.finished).toEqual([TestFinishedAthlete])
      expect(result.athletes.value.unfinished).toEqual([TestUnfinishedAthlete])
      expect(result.areAvailable.value).toEqual(true)
    })

    it('should return filtered athletes of all runner status variants', () => {
      const testRunners = [
        {
          ...TestFinishedAthlete,
          status: RunnerStatus.Ok,
        },
        {
          ...TestFinishedAthlete,
          status: RunnerStatus.NotCompeting,
        },
        { ...TestFinishedAthlete, status: RunnerStatus.OverMaxTime },
        { ...TestFinishedAthlete, status: RunnerStatus.DidNotFinish },
        { ...TestFinishedAthlete, status: RunnerStatus.Mispunch },
        { ...TestFinishedAthlete, status: RunnerStatus.Disqualified },
        { ...TestFinishedAthlete, status: RunnerStatus.DidNotStart },
        {
          ...TestFinishedAthlete,
          status: RunnerStatus.Running,
        },
        {
          ...TestFinishedAthlete,
          status: RunnerStatus.NotStarted,
        },
      ]

      render(getTestComponent(testRunners), {
        global: {
          provide: {
            [useDataProviderKey as symbol]: useMockData,
          },
        },
      })

      const unfinishedStatuses = [RunnerStatus.Running, RunnerStatus.NotStarted]

      expect(result.status.value).toEqual('success')
      for (const finished of result.athletes.value.finished) {
        expect(unfinishedStatuses).not.toContain(finished.status)
      }
      for (const unfinished of result.athletes.value.unfinished) {
        expect(unfinishedStatuses).toContain(unfinished.status)
      }
    })
  })

  describe('useFinishedAthletes', () => {
    it('should return empty array when no athletes', () => {
      const athletes = ref<ClassifyRunners>({ finished: [], unfinished: [] })
      const finishedAthletes = useFinishedAthletes(athletes)
      expect(finishedAthletes.value.firstRow).toEqual(null)
      expect(finishedAthletes.value.restRows).toEqual([])
    })

    it('should return empty array when no finished athletes', () => {
      const athletes = ref<ClassifyRunners>({
        finished: [],
        unfinished: [TestUnfinishedAthlete],
      })
      const finishedAthletes = useFinishedAthletes(athletes)
      expect(finishedAthletes.value.firstRow).toEqual(null)
      expect(finishedAthletes.value.restRows).toEqual([])
    })

    it('should return finished athletes', () => {
      const athletes = ref<ClassifyRunners>({
        finished: [TestFinishedAthlete],
        unfinished: [TestUnfinishedAthlete],
      })
      const finishedAthletes = useFinishedAthletes(athletes)
      expect(finishedAthletes.value.firstRow).not.toEqual(null)
      expect(finishedAthletes.value.restRows).toEqual([])
    })

    it('should return finished athletes sorted by time, ranked and with calculated losses', () => {
      const athletes = ref<ClassifyRunners>({
        finished: [
          {
            ...TestFinishedAthlete,
            timeM: 1,
            timeS: 1,
          },
          {
            ...TestFinishedAthlete,
            timeM: 1,
            timeS: 2,
          },
          {
            ...TestFinishedAthlete,
            timeM: 1,
            timeS: 3,
          },
          {
            ...TestFinishedAthlete,
            timeM: 1,
            timeS: 4,
          },
          {
            ...TestFinishedAthlete,
            timeM: 1,
            timeS: 5,
          },
          {
            ...TestFinishedAthlete,
            timeM: 1,
            timeS: 6,
          },
        ],
        unfinished: [TestUnfinishedAthlete],
      })
      const finishedAthletes = useFinishedAthletes(athletes)
      expect(finishedAthletes.value.firstRow).not.toEqual(null)
      expect(finishedAthletes.value.restRows.length).toEqual(
        athletes.value.finished.length - 1
      )

      expect(finishedAthletes.value.firstRow?.rank).toEqual(1)
      expect(finishedAthletes.value.firstRow?.time).toEqual('1:01')
      expect(finishedAthletes.value.firstRow?.loss).toEqual('')

      for (let i = 0; i < finishedAthletes.value.restRows.length; i++) {
        const sourceAthlete = athletes.value.finished[i + 1]
        const parsedAthlete = finishedAthletes.value.restRows[i]
        expect(parsedAthlete.rank).toEqual(i + 2)
        expect(parsedAthlete.time).toEqual(
          `${sourceAthlete.timeM}:0${sourceAthlete.timeS}`
        )
        expect(finishedAthletes.value.restRows[i].loss).toEqual(`0:0${i + 1}`)
      }
    })

    it('should sort correctly when input is unsorted', () => {
      const athletes = ref<ClassifyRunners>({
        finished: [
          {
            ...TestFinishedAthlete,
            timeM: 2,
            timeS: 2,
          },
          {
            ...TestFinishedAthlete,
            timeM: 3,
            timeS: 3,
          },
          {
            ...TestFinishedAthlete,
            timeM: 1,
            timeS: 1,
          },
        ],
        unfinished: [],
      })

      const finishedAthletes = useFinishedAthletes(athletes)
      expect(finishedAthletes.value.firstRow?.time).toEqual('1:01')

      for (let i = 0; i < finishedAthletes.value.restRows.length; i++) {
        expect(finishedAthletes.value.restRows[i].time).toEqual(
          `${i + 2}:0${i + 2}`
        )
      }
    })

    it('should solve draw correctly (same rank, same loss)', () => {
      const athletes = ref<ClassifyRunners>({
        finished: [
          {
            ...TestFinishedAthlete,
            timeM: 2,
            timeS: 2,
          },
          {
            ...TestFinishedAthlete,
            timeM: 2,
            timeS: 2,
          },
          {
            ...TestFinishedAthlete,
            timeM: 1,
            timeS: 1,
          },
          {
            ...TestFinishedAthlete,
            timeM: 1,
            timeS: 1,
          },
        ],
        unfinished: [],
      })

      const finishedAthletes = useFinishedAthletes(athletes)
      expect(finishedAthletes.value.firstRow?.time).toEqual('1:01')

      const drawFirst = finishedAthletes.value.restRows[0]
      expect(drawFirst.rank).toEqual(1)
      expect(drawFirst.loss).toEqual('')
      for (let i = 1; i < finishedAthletes.value.restRows.length; i++) {
        expect(finishedAthletes.value.restRows[i].rank).toEqual(3)
        expect(finishedAthletes.value.restRows[i].loss).toEqual('1:01')
      }
    })

    describe('useUnfinishedAthletes', () => {
      it('should return empty array when no athletes', () => {
        const athletes = ref<ClassifyRunners>({ finished: [], unfinished: [] })
        const unfinishedAthletes = useUnfinishedAthletes(athletes)
        expect(unfinishedAthletes.value).toEqual([])
      })

      it('should return empty array when no unfinished athletes', () => {
        const athletes = ref<ClassifyRunners>({
          finished: [TestFinishedAthlete],
          unfinished: [],
        })
        const unfinishedAthletes = useUnfinishedAthletes(athletes)
        expect(unfinishedAthletes.value).toEqual([])
      })

      it('should return athletes sorted first by startTime and then by status', () => {
        const now = new Date()
        const athletes = ref<ClassifyRunners>({
          unfinished: [
            {
              ...TestUnfinishedAthlete,
              status: RunnerStatus.NotStarted,
              startTime: addMinutes(now, 3).valueOf(),
            },
            {
              ...TestUnfinishedAthlete,
              status: RunnerStatus.NotStarted,
              startTime: addMinutes(now, 2).valueOf(),
            },
            {
              ...TestUnfinishedAthlete,
              status: RunnerStatus.Running,
              startTime: addMinutes(now, 1).valueOf(),
            },
            {
              ...TestUnfinishedAthlete,
              status: RunnerStatus.Running,
              startTime: now.valueOf(),
            },
          ],
          finished: [],
        })
        const unfinishedAthletes = useUnfinishedAthletes(athletes)
        expect(unfinishedAthletes.value[0].status).toEqual(RunnerStatus.Running)
        expect(unfinishedAthletes.value[1].status).toEqual(RunnerStatus.Running)
        expect(unfinishedAthletes.value[2].status).toEqual(
          RunnerStatus.NotStarted
        )
        expect(unfinishedAthletes.value[3].status).toEqual(
          RunnerStatus.NotStarted
        )
      })
    })
  })
})
