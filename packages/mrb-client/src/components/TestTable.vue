<script setup lang="ts">
import { ref, inject } from 'vue'
import TableHeader from './TableHeader.vue'
import TableRow from './TableRow.vue'

import type { Category, RawRunner, RunnerWithStats } from '@/types/category'

const props = defineProps<{ category: Category }>()
const rows = Math.floor(Math.random() * 20) + 10

const tableRef = ref<HTMLElement>()
const registerTable = inject('addTable')

const testDataRow = {}

const getRandomTime = () => {
  const timeM = Math.floor(Math.random() * 35) + 35
  const timeS = Math.floor(Math.random() * 60)
  return { timeM, timeS }
}
const rawData: RawRunner[] = new Array(rows).fill(testDataRow).map(() => ({
  surname: 'Doe',
  firstName: props.category.gender === 'F' ? 'Jane' : 'Joe',
  si: '81234567',
  club: 'Czech republic',
  ...getRandomTime(),
}))

rawData.sort((a, b) => {
  if (a.timeM !== b.timeM) return a.timeM - b.timeM
  if (a.timeS !== b.timeS) return a.timeS - b.timeS
  return 0
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

const formattedData = formatData(rawData)

const [firstRow, ...restRows] = formattedData

// add function that access tableRef element and logs bounding client rect
function logTableRect() {
  if (!tableRef.value) return
  console.log(tableRef.value.getBoundingClientRect())
}

registerTable(tableRef)
</script>

<template>
  <div ref="tableRef" @click="logTableRect">
    <TableHeader class="p-3" :category="props.category" />
    <!-- TODO Add 2rem text class -->
    <div class="w-full text-3xl font-bold bg-white">
      <TableRow :data="firstRow" :is-even="false" class="sticky top-16">
      </TableRow>
      <TableRow
        v-for="(row, index) in restRows"
        :data="row"
        :key="row.rank"
        :is-even="index % 2 === 0"
      >
      </TableRow>
    </div>
  </div>
</template>
