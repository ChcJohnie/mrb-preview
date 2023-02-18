<script setup lang="ts">
import { ref } from 'vue'
import { useResizeObserver } from '@vueuse/core'

import ScrollColumn from '@/components/ScrollColumn.vue'
import CategoryTable from '@/components/CategoryTable.vue'
import CategoryTestTable from '@/components/CategoryTestTable.vue'
import TableSettings from '@/components/TableSettings.vue'
import { useTableSizingStore } from '@/stores/tableSizing'
import type { Category } from '@/types/category'

// import { useQuery } from '@tanstack/vue-query'
// import axios from 'axios'

// const { isLoading, isError, data, error } = useQuery({
//   queryKey: ['categories'],
//   queryFn: () =>
//     axios
//       .get('http://liveresults.ch/WCF2022/long/config.json')
//       .then((res) => res.data),
//   select: (data) => data.categories,
// })

const tableViewRef = ref<HTMLElement | null>(null)
const tableSizing = useTableSizingStore()

const data: Category[] = [
  {
    id: 1,
    name: 'H21C',
    length: 10.2,
    climb: 255,
    controls: 20,
    gender: 'M',
  },
  {
    id: 2,
    name: 'D21C',
    length: 8.2,
    climb: 150,
    controls: 16,
    gender: 'F',
  },
  {
    id: 3,
    name: 'HDR',
    length: 10.2,
    climb: 255,
    controls: 20,
    gender: 'X',
  },
  {
    id: 4,
    name: 'JKL',
    length: 10.2,
    climb: 255,
    controls: 20,
    gender: 'M',
  },
  {
    id: 5,
    name: 'MNO',
    length: 10.2,
    climb: 255,
    controls: 20,
    gender: 'M',
  },
  {
    id: 6,
    name: 'PQR',
    length: 10.2,
    climb: 255,
    controls: 20,
    gender: 'M',
  },
]

function analyzeTableSizes() {
  if (!tableViewRef.value) return
  tableSizing.setAnalyzed(false)
  const tableViewElementRect = tableViewRef.value.getBoundingClientRect()
  tableSizing.tableViewHeight = tableViewElementRect.height
  tableSizing.setAnalyzed(true)
}

useResizeObserver(tableViewRef, analyzeTableSizes)
</script>

<template>
  <div ref="tableViewRef" class="font-mrb grow flex overflow-hidden">
    <!-- <div v-if="!isLoading && !isError">
      <span v-for="category in data" :key="category.id">{{
        category.name
      }}</span>
    </div> -->

    <ScrollColumn v-if="tableSizing.isAnalyzed">
      <CategoryTable
        v-for="category in data"
        :key="category.id"
        :category="category"
        class="mb-4"
      />
    </ScrollColumn>
    <CategoryTestTable v-else />
    <TableSettings class="fixed bottom-6 right-0 z-3" />
  </div>
</template>
