<script setup lang="ts">
import { ref, inject } from 'vue'
import TableHeader from './TableHeader.vue'
import TableRow from './TableRow.vue'

import type { Category } from '@/types/category'

const props = defineProps<{ category: Category }>()
const rows = Math.floor(Math.random() * 20) + 10

const tableRef = ref<HTMLElement>()
const registerTable = inject('addTable')

const testDataRow = { name: 'Runner', time: '62:48' }

const testData = new Array(rows).fill(testDataRow).map((value, index) => ({
  rank: index + 1,
  ...value,
}))

const [firstRow, ...restRows] = testData

// add function that access tableRef element and logs bounding client rect
function logTableRect() {
  if (!tableRef.value) return
  console.log(tableRef.value.getBoundingClientRect())
}

registerTable(tableRef)
</script>

<template>
  <div ref="tableRef" @click="logTableRect">
    <TableHeader :category="props.category" />
    <table class="w-full text-3xl font-bold">
      <thead class="sticky top-6 bg-white hidden">
        <tr>
          <th class="text-left">Rank</th>
          <th class="text-left">Name</th>
          <th class="text-left">Time</th>
        </tr>
      </thead>
      <tbody>
        <TableRow :data="firstRow" class="sticky top-10"> </TableRow>
        <TableRow v-for="row in restRows" :data="row" :key="row.rank">
        </TableRow>
      </tbody>
    </table>
  </div>
</template>
