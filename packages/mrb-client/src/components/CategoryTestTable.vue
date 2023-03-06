<script setup lang="ts">
import { provide, ref, unref } from 'vue'
import { useIntervalFn } from '@vueuse/core'

import DataProvider from './DataProvider.vue'
import CategoryTable from './CategoryTable.vue'

import { useTableSizingStore } from '@/stores/tableSizing'

import { RunnerStatus, type Category, type RawRunner } from '@/types/category'
import { addScrollTableElementKey } from '@/types/providers'
import type { AddScrollTableElementFn } from '@/types/providers'
import type { Competition } from '@/types/competition'

defineProps<{
  competition: Competition
}>()

const tableSizing = useTableSizingStore()
const testTableElement = ref<HTMLElement>()

const setTestTable: AddScrollTableElementFn = (component) => {
  testTableElement.value = component.value
  analyzeTestTable()
}
useIntervalFn(analyzeTestTable, 100)
provide(addScrollTableElementKey, setTestTable)

function analyzeTestTable() {
  const tableElement = unref(testTableElement)
  if (!tableElement) return
  const [headerElement, runnerElement] = tableElement.children // ! Implementation detail, expect cat header as first child
  if (!headerElement || !runnerElement) return
  tableSizing.headerHeight = headerElement.getBoundingClientRect().height
  tableSizing.lineHeight = runnerElement.getBoundingClientRect().height
  tableSizing.setAnalyzed(true)
}

const testRunners: RawRunner[] = [
  {
    firstName: 'Test',
    surname: 'Runner',
    si: '81234567',
    club: 'Test Club',
    timeM: 111,
    timeS: 11,
    status: RunnerStatus.Ok,
  },
]

const testCategory: Category = {
  id: 1,
  name: 'TEST',
  length: 11.1,
  climb: 111,
  controls: 11,
  gender: 'X',
  runners: testRunners,
}
</script>

<template>
  <div class="flex-1 px-2">
    <DataProvider provider="test">
      <CategoryTable
        :competition="competition"
        :competition-id="1"
        :category="testCategory"
      />
    </DataProvider>
  </div>
</template>
