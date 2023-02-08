<script setup lang="ts">
import TestTable from '@/components/TestTable.vue'
import ScrollColumn from '@/components/ScrollColumn.vue'

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
</script>

<template>
  <div class="px-4 py-5 sm:px-6">
    <!-- <div v-if="!isLoading && !isError">
      <span v-for="category in data" :key="category.id">{{
        category.name
      }}</span>
    </div> -->

    <ScrollColumn>
      <TestTable class="my-4" :name="'ABC'" :rows="10" />
      <TestTable class="my-4" :name="'ABC'" :rows="10" />
      <TestTable class="my-4" :name="'DEF'" :rows="20" />
      <TestTable class="my-4" :name="'GHI'" :rows="5" />
      <TestTable class="my-4" :name="'JKL'" :rows="15" />
    </ScrollColumn>
  </div>
</template>
