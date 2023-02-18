<script setup lang="ts">
import TestTable from '@/components/TestTable.vue'
import ScrollColumn from '@/components/ScrollColumn.vue'
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
</script>

<template>
  <div class="font-mrb grow flex overflow-hidden">
    <!-- <div v-if="!isLoading && !isError">
      <span v-for="category in data" :key="category.id">{{
        category.name
      }}</span>
    </div> -->

    <ScrollColumn>
      <TestTable
        v-for="category in data"
        :key="category.id"
        :category="category"
        class="my-4"
      />
    </ScrollColumn>
  </div>
</template>
