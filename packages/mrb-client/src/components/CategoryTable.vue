<script setup lang="ts">
import { ref, inject, onMounted, computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'

import TableHeader from './CategoryTableHeader.vue'
import TableRow from './CategoryTableRow.vue'

import { addScrollTableElementKey } from '@/types/providers'
import type {
  Category,
  RawRunner,
  RunnerWithStats,
  LSRunner,
} from '@/types/category'

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
  return runners.map((runner) => {
    const timeMS = parseFloat(runner.result) * 10
    const timeM = Math.floor(timeMS / 60000)
    const timeS = Math.floor((timeMS - timeM * 60000) / 1000)
    return {
      surname: runner.name,
      firstName: '',
      club: runner.club,
      timeM,
      timeS,
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
  runnersCopy.sort((a, b) => {
    if (a.timeM !== b.timeM) return a.timeM - b.timeM
    if (a.timeS !== b.timeS) return a.timeS - b.timeS
    return 0
  })
  const formatted = formatData(runnersCopy)
  const [firstRow, ...restRows] = formatted
  return { firstRow, restRows }
})

function formatData(data: RawRunner[]): RunnerWithStats[] {
  const firstItem = {
    ...data[0],
    rank: 1,
    time: `${data[0].timeM}:${formatSeconds(data[0].timeS)}`,
    loss: '',
  }
  let compareTime = firstItem.time
  let currentRank = firstItem.rank
  const otherItems = data.slice(1).map((item, index) => {
    const itemTime = `${item.timeM}:${formatSeconds(item.timeS)}`
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
  if (lossSeconds >= 0) return `${lossMinutes}:${formatSeconds(lossSeconds)}`
  return `${lossMinutes - 1}:${formatSeconds(60 + lossSeconds)}`
}

function formatSeconds(seconds: number) {
  return seconds >= 10 ? seconds.toString() : `0${seconds}`
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
