<script setup lang="ts">
import { ref } from 'vue'
import { useResizeObserver } from '@vueuse/core'
import { useQuery } from '@tanstack/vue-query'

import TableHeader from '@/components/TableHeader.vue'
import ScrollColumn from '@/components/ScrollColumn.vue'
import CategoryTable from '@/components/CategoryTable.vue'
import CategoryTestTable from '@/components/CategoryTestTable.vue'
import TableSettings from '@/components/TableSettings.vue'

import { useTableSizingStore } from '@/stores/tableSizing'
import type { Category } from '@/types/category'
import type { Event } from '@/types/event'
import { classesTestData, createTestRunners } from '@/utils/testData'

const tableViewRef = ref<HTMLElement | null>(null)
const tableSizing = useTableSizingStore()
const EVENT_ID = 25126

const { data: eventData } = useQuery({
  queryKey: ['eventData'],
  queryFn: async () => {
    if (!EVENT_ID)
      return { name: 'TEST EVENT', organizer: 'TEST CLUB' } as Event
    const response = await fetch(
      `https://liveresultat.orientering.se/api.php?method=getcompetitioninfo&comp=${EVENT_ID}`
    )
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    const eventData = (await response.json()) as Event
    return eventData
  },
})

const { status: classesStatus, data: eventClasses } = useQuery({
  queryKey: ['eventClasses'],
  queryFn: async () => {
    if (!EVENT_ID) return classesTestData
    const response = await fetch(
      `https://liveresultat.orientering.se/api.php?method=getclasses&comp=${EVENT_ID}`
    )
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    const { classes } = (await response.json()) as {
      classes: Array<{ className: string }>
    }
    const formattedClasses: Category[] = classes.map((eventClass) => ({
      id: eventClass.className,
      name: eventClass.className,
      gender: guessGender(eventClass.className),
    }))
    return formattedClasses
  },
})

function guessGender(className: string) {
  const firstLetter = className.charAt(0)
  if (['H', 'M'].includes(firstLetter)) return 'M'
  if (['D', 'W', 'F'].includes(firstLetter)) return 'F'
  return 'X'
}

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
  <table-header v-if="eventData" :event="eventData" />
  <div ref="tableViewRef" class="font-mrb grow flex overflow-hidden p-t3 pl-3">
    <ScrollColumn v-if="tableSizing.isAnalyzed && classesStatus === 'success'">
      <CategoryTable
        v-for="category in eventClasses"
        :key="category.id"
        :event-id="EVENT_ID"
        :runners="
          EVENT_ID ? undefined : createTestRunners({ gender: category.gender })
        "
        :category="category"
        class="mb-4"
      />
    </ScrollColumn>
    <div v-else-if="classesStatus === 'loading'">Loading data</div>
    <CategoryTestTable v-else />
    <TableSettings class="fixed bottom-6 right-0 z-3" />
  </div>
</template>
