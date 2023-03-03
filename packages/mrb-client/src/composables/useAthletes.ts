import { computed, inject, type Ref } from 'vue'

import { useDataProviderKey } from '@/types/providers'
import { RunnerStatus } from '@/types/category'
import type { Category, RawRunner, RunnerWithStats } from '@/types/category'
import type { Competition } from '@/types/competition'
import { formatMinutesSeconds } from '@/utils/dateTime'

export type ClassifyRunners = {
  finished: RawRunner[]
  unfinished: RawRunner[]
}

type ClassifiedFinishedRunners = {
  firstRow: RunnerWithStats | null
  restRows: RunnerWithStats[]
}

export function useAthletes({
  competition,
  category,
  fetchEnabled,
}: {
  competition: Competition
  category: Category
  fetchEnabled: Ref<boolean>
}) {
  const useDataProvider = inject(useDataProviderKey)
  if (!useDataProvider) throw new Error('No data provider found')
  const { getAthletesLoader } = useDataProvider()

  /* Runners can be passed with category in test table context */
  const { rawRunners, status } = getAthletesLoader({
    category,
    competition,
    fetchEnabled,
  })

  const athletes = computed((): ClassifyRunners => {
    if (status.value !== 'success' || !rawRunners.value)
      return { finished: [], unfinished: [] }
    return rawRunners.value.reduce(
      (runners, runner) => {
        if (
          runner.status === RunnerStatus.NotStarted ||
          runner.status === RunnerStatus.Running
        ) {
          runners.unfinished.push(runner)
        } else {
          runners.finished.push(runner)
        }
        return runners
      },
      { finished: [], unfinished: [] } as ClassifyRunners
    )
  })

  const areAvailable = computed(
    () =>
      athletes.value.finished.length > 0 || athletes.value.unfinished.length > 0
  )

  return { status, athletes, areAvailable }
}

export function useFinishedAthletes(athletes: Ref<ClassifyRunners>) {
  const finishedAthletes = computed(() => {
    if (!athletes.value.finished.length) return { firstRow: null, restRows: [] }
    const runnersCopy = [...athletes.value.finished]
    runnersCopy.sort(finishedRunnerSortFunction)
    const formatted = formatFinishedRunners(runnersCopy)
    return formatted
  })

  return finishedAthletes
}

function finishedRunnerSortFunction(a: RawRunner, b: RawRunner) {
  if (a.status !== b.status) return a.status - b.status
  if (a.timeM !== b.timeM) return a.timeM - b.timeM
  if (a.timeS !== b.timeS) return a.timeS - b.timeS
  return 0
}

function formatFinishedRunners(data: RawRunner[]): ClassifiedFinishedRunners {
  const firstRunner = data[0]
  if (firstRunner.status !== RunnerStatus.Ok)
    return { firstRow: null, restRows: data } // First runner after sort is not finished, nothing to format
  const firstRow = {
    ...firstRunner,
    rank: 1,
    time: formatMinutesSeconds(firstRunner.timeM, firstRunner.timeS),
    loss: '',
  }
  let compareTime = firstRow.time
  let currentRank = firstRow.rank
  const restRows = data.slice(1).map((runner, index) => {
    if (runner.status !== RunnerStatus.Ok) return runner // Runner is not finished, nothing to format
    const itemTime = formatMinutesSeconds(runner.timeM, runner.timeS)
    const isDraw = compareTime === itemTime
    if (!isDraw) {
      currentRank = index + 2
      compareTime = itemTime
    }
    return {
      ...runner,
      rank: currentRank,
      time: itemTime,
      loss: calculateLoss(firstRow, runner),
    }
  })
  // TODO Move first place draw athletes to firstRow []
  return { firstRow, restRows }
}

function calculateLoss(leadItem: RawRunner, compareItem: RawRunner) {
  const lossSeconds = compareItem.timeS - leadItem.timeS
  const lossMinutes = compareItem.timeM - leadItem.timeM
  if (lossSeconds === 0 && lossMinutes === 0) return ''
  if (lossSeconds >= 0) return formatMinutesSeconds(lossMinutes, lossSeconds)
  return formatMinutesSeconds(lossMinutes - 1, 60 + lossSeconds)
}

export function useUnfinishedAthletes(athletes: Ref<ClassifyRunners>) {
  const unfinishedAthletes = computed(() => {
    if (!athletes.value.unfinished.length) return []
    const runnersCopy = [...athletes.value.unfinished]
    runnersCopy.sort(unfinishedRunnerSortFunction)
    return runnersCopy
  })

  return unfinishedAthletes
}

function unfinishedRunnerSortFunction(a: RawRunner, b: RawRunner) {
  if (a.startTime && b.startTime) return a.startTime - b.startTime
  if (a.status !== b.status) return a.status - b.status
  return a.surname < b.surname ? -1 : 1
}
