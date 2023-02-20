<script setup lang="ts">
import { ref, inject, onMounted, computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { startOfToday } from 'date-fns'

import TableHeader from './CategoryTableHeader.vue'
import TableRow from './CategoryTableRow.vue'

import { addScrollTableElementKey } from '@/types/providers'
import { RunnerStatus } from '@/types/category'
import type {
  Category,
  RawRunner,
  RunnerWithStats,
  LSRunner,
} from '@/types/category'
import { statusMap } from '@/utils/liveResultat'
import {
  getMinutesSecondsFromMilliseconds,
  formatMinutesSeconds,
} from '@/utils/dateTime'

const props = defineProps<{
  eventId: number
  category: Category
  runners?: RawRunner[]
}>()

const tableRef = ref<HTMLElement | null>(null)
const addScrollTable = inject(addScrollTableElementKey)

const { status, data: rawRunners } = useQuery({
  queryKey: ['runners', props.category.id],
  queryFn: async () => {
    if (props.runners) return props.runners
    const response = await fetch(
      `https://liveresultat.orientering.se/api.php?comp=${props.eventId}&method=getclassresults&unformattedTimes=true&class=${props.category.id}`
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
    const startTime = todayStartTimeStamp + startTimeMS
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

const runnersFormatted = computed(() => {
  if (
    status.value !== 'success' ||
    !rawRunners.value ||
    !rawRunners.value.length
  )
    return { firstRow: null, restRows: null }
  const runnersCopy = [...rawRunners.value]
  runnersCopy.sort(runnerSortFunction)
  const formatted = formatData(runnersCopy)
  const [firstRow, ...restRows] = formatted
  return { firstRow, restRows }
})

function runnerSortFunction(a: RawRunner, b: RawRunner) {
  if (a.status !== b.status) return a.status - b.status
  if (a.timeM !== b.timeM) return a.timeM - b.timeM
  if (a.timeS !== b.timeS) return a.timeS - b.timeS
  return 0
}

function formatData(data: RawRunner[]): RunnerWithStats[] {
  const firstItem = {
    ...data[0],
    rank: 1,
    time: formatMinutesSeconds(data[0].timeM, data[0].timeS),
    loss: '',
  }
  let compareTime = firstItem.time
  let currentRank = firstItem.rank
  const otherItems = data.slice(1).map((item, index) => {
    if (item.status !== RunnerStatus.Ok) return item
    const itemTime = formatMinutesSeconds(item.timeM, item.timeS)
    const isDraw = compareTime === itemTime
    if (!isDraw) {
      currentRank = index + 2
      compareTime = itemTime
    }
    return {
      ...item,
      rank: currentRank,
      time: itemTime,
      loss: calculateLoss(firstItem, item),
    }
  })
  otherItems.unshift(firstItem)
  return otherItems
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
      v-if="status === 'success' && runnersFormatted.firstRow"
      class="w-full text-3xl font-bold bg-white"
    >
      <TableRow
        :data="runnersFormatted.firstRow"
        :is-even="false"
        class="sticky top-16"
      >
      </TableRow>
      <TableRow
        v-for="(row, index) in runnersFormatted.restRows"
        :data="row"
        :key="row.rank"
        :is-even="index % 2 === 0"
      >
      </TableRow>
    </div>
  </div>
</template>
