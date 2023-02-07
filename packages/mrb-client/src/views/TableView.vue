<script setup lang="ts">
import TestTable from '@/components/TestTable.vue'
import ScrollColumn from '@/components/ScrollColumn.vue'
</script>

<template>
  <div class="px-4 py-5 sm:px-6">
    <ScrollColumn>
      <TestTable class="my-4" :name="'ABC'" :rows="10" />
      <TestTable class="my-4" :name="'ABC'" :rows="10" />
      <TestTable class="my-4" :name="'DEF'" :rows="20" />
      <TestTable class="my-4" :name="'GHI'" :rows="5" />
      <TestTable class="my-4" :name="'JKL'" :rows="15" />
    </ScrollColumn>
  </div>
</template>
