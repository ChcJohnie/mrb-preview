<script setup lang="ts">
import { ref } from 'vue'
import TableRow from './TableRow.vue'

const props = defineProps<{ rows: number; name: string }>()
const tableRef = ref<HTMLElement>()

const testDataRow = { name: 'Runner', time: '62:48' }

const testData = new Array(props.rows)
  .fill(testDataRow)
  .map((value, index) => ({
    rank: index + 1,
    ...value,
  }))

const [firstRow, ...restRows] = testData

// add function that access tableRef element and logs bounding client rect
function logTableRect() {
  if (!tableRef.value) return
  console.log(tableRef.value.getBoundingClientRect())
}
</script>

<template>
  <div>
    <h2 class="sticky top-0 bg-white">{{ name }}</h2>
    <table ref="tableRef" class="w-full" @click="logTableRect">
      <thead class="sticky top-6 bg-white">
        <tr>
          <th class="text-left">Rank</th>
          <th class="text-left">Name</th>
          <th class="text-left">Time</th>
        </tr>
      </thead>
      <tbody>
        <TableRow :data="firstRow" class="sticky top-12"> </TableRow>
        <TableRow v-for="row in restRows" :data="row" :key="row.rank">
        </TableRow>
      </tbody>
    </table>
  </div>
</template>
