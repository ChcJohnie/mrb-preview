<script setup lang="ts">
import { ref, inject, onMounted, computed, watchEffect } from 'vue'
import { useElementVisibility } from '@vueuse/core'
import { useQuery } from '@tanstack/vue-query'
import { startOfToday } from 'date-fns'

import TableHeader from './CategoryTableHeader.vue'
import TableFinishedRow from './CategoryTableFinishedRow.vue'
import TableUnfinishedRow from './CategoryTableUnfinishedRow.vue'

import { addScrollTableElementKey } from '@/types/providers'
import { RunnerStatus } from '@/types/category'
import type {
  Category,
  RawRunner,
  RunnerWithStats,
  LSRunner,
} from '@/types/category'
import type { EventInfo } from '@/types/event'
import { statusMap, adjustStartTimeToCET } from '@/utils/liveResultat'
import {
  getMinutesSecondsFromMilliseconds,
  formatMinutesSeconds,
} from '@/utils/dateTime'

const props = defineProps<{
  event: EventInfo
  category: Category
  runners?: RawRunner[]
}>()

const tableRef = ref<HTMLElement | null>(null)
const addScrollTable = inject(addScrollTableElementKey)
const visibilityTarget = inject('TableVisibilityTarget', null)
// TODO Adjust VueUse version to allow bottom margin so one page below fold is 'visible'
const isElementVisible = useElementVisibility(tableRef, {
  scrollTarget: visibilityTarget,
})

const { status, data: rawRunners } = useQuery({
  queryKey: ['runners', props.category.id],
  queryFn: async () => {
    if (props.runners) return props.runners
    const response = await fetch(
      `https://liveresultat.orientering.se/api.php?comp=${props.event.id}&method=getclassresults&unformattedTimes=true&class=${props.category.id}`
    )
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    const { results } = (await response.json()) as {
      results: LSRunner[]
    }
    return formatLSRunnersToRaw(results)
  },
})

function formatLSRunnersToRaw(runners: LSRunner[]): RawRunner[] {
  const todayStartTimeStamp = startOfToday().valueOf()
  return runners.map((runner) => {
    const timeMS = parseFloat(runner.result) * 10
    const { minutes: timeM, seconds: timeS } =
      getMinutesSecondsFromMilliseconds(timeMS)
    const status = statusMap[runner.status]
    const startTimeMS = runner.start * 10
    const startTime = adjustStartTimeToCET(
      todayStartTimeStamp + startTimeMS,
      props.event.timediff
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

type ClassifyRunners = {
  finished: RawRunner[]
  unfinished: RawRunner[]
}
const runners = computed((): ClassifyRunners => {
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

type ClassifiedFinishedRunners = {
  firstRow: RunnerWithStats | null
  restRows: RunnerWithStats[]
}
const finishedRunners = computed(() => {
  if (!runners.value.finished.length) return { firstRow: null, restRows: [] }
  const runnersCopy = [...runners.value.finished]
  runnersCopy.sort(finishedRunnerSortFunction)
  const formatted = formatFinishedRunners(runnersCopy)
  return formatted
})

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

const unfinishedRunners = computed(() => {
  if (!runners.value.unfinished.length) return []
  const runnersCopy = [...runners.value.unfinished]
  runnersCopy.sort(unfinishedRunnerSortFunction)
  return runnersCopy
})

function unfinishedRunnerSortFunction(a: RawRunner, b: RawRunner) {
  if (a.startTime && b.startTime) return a.startTime - b.startTime
  if (a.status !== b.status) return a.status - b.status
  return a.surname < b.surname ? -1 : 1
}

function calculateLoss(leadItem: RawRunner, compareItem: RawRunner) {
  const lossSeconds = compareItem.timeS - leadItem.timeS
  const lossMinutes = compareItem.timeM - leadItem.timeM
  if (lossSeconds === 0 && lossMinutes === 0) return ''
  if (lossSeconds >= 0) return formatMinutesSeconds(lossMinutes, lossSeconds)
  return formatMinutesSeconds(lossMinutes - 1, 60 + lossSeconds)
}

onMounted(() => {
  if (addScrollTable && tableRef.value) addScrollTable(ref(tableRef.value))
})
</script>

<template>
  <div ref="tableRef">
    <TableHeader class="p-3" :category="props.category" />
    <!-- TODO Add 2rem text class -->
    <div
      v-if="status === 'success' && rawRunners?.length"
      class="w-full text-3xl font-bold bg-white"
    >
      <TableFinishedRow
        v-if="finishedRunners.firstRow"
        :data="finishedRunners.firstRow"
        :is-even="false"
        class="sticky top-16"
      >
      </TableFinishedRow>
      <TableFinishedRow
        v-for="(row, index) in finishedRunners.restRows"
        :data="row"
        :key="row.rank"
        :is-even="index % 2 === 0"
      >
      </TableFinishedRow>
      <TableUnfinishedRow
        v-for="(row, index) in unfinishedRunners"
        :data="row"
        :key="index"
        :is-even="index % 2 === 0"
        :is-visible="isElementVisible"
      >
      </TableUnfinishedRow>
    </div>
  </div>
</template>
