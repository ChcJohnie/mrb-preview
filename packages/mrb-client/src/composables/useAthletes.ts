import { ref, computed, type Ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { startOfToday } from 'date-fns'

import { RunnerStatus } from '@/types/category'
import type {
  Category,
  RawRunner,
  LSRunner,
  RunnerWithStats,
} from '@/types/category'
import type { Competition } from '@/types/competition'
import { statusMap, adjustStartTimeToCET } from '@/utils/liveResultat'
import {
  getMinutesSecondsFromMilliseconds,
  formatMinutesSeconds,
} from '@/utils/dateTime'

type ClassifyRunners = {
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
  fetchEnabled?: Ref<boolean>
}) {
  const lastHash = ref<string>()
  const enabled = computed(() =>
    typeof fetchEnabled === 'undefined' ? true : fetchEnabled.value
  )
  const { status, data: rawRunners } = useQuery({
    queryKey: ['runners', category.id],
    queryFn: async () => {
      if (category.runners) return category.runners
      const response = await fetch(
        `https://liveresultat.orientering.se/api.php?comp=${
          competition.id
        }&method=getclassresults&unformattedTimes=true&class=${category.id}${
          lastHash.value ? `&last_hash=${lastHash.value}` : ''
        }`
      )
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      const res = (await response.json()) as
        | {
            results: LSRunner[]
            hash: string
          }
        | { status: 'NOT MODIFIED' }
      /*
      StructuralSharing should revert to old data when NOT MODIFIED is in response
    */
      if (!('results' in res)) {
        return null
      }
      lastHash.value = res.hash
      return formatLSRunnersToRaw(res.results, competition)
    },
    structuralSharing: (oldData, newData) => {
      if (!oldData) return newData
      if (!newData) return oldData
      return newData
    },
    enabled,
    refetchInterval: 15 * 1000,
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

function formatLSRunnersToRaw(
  runners: LSRunner[],
  competition: Competition
): RawRunner[] {
  const todayStartTimeStamp = startOfToday().valueOf()
  return runners.map((runner) => {
    const timeMS = parseFloat(runner.result) * 10
    const { minutes: timeM, seconds: timeS } =
      getMinutesSecondsFromMilliseconds(timeMS)
    const status = statusMap[runner.status]
    const startTimeMS = runner.start * 10
    const startTime = adjustStartTimeToCET(
      todayStartTimeStamp + startTimeMS,
      competition.timediff
    )
    return {
      surname: runner.name,
      firstName: '',
      club: runner.club,
      timeM,
      timeS,
      startTime,
      status,
    }
  })
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
