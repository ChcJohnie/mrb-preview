<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useResizeObserver } from '@vueuse/core'
import { useQuery } from '@tanstack/vue-query'

import EventHeader from '@/components/EventHeader.vue'
import ScrollColumn from '@/components/ScrollColumn.vue'
import CategoryTable from '@/components/CategoryTable.vue'
import CategoryTestTable from '@/components/CategoryTestTable.vue'
import EventSettings from '@/components/EventSettings.vue'

import { useTableSizingStore } from '@/stores/tableSizing'
import type { Category } from '@/types/category'
import type { EventInfo } from '@/types/event'
import { fixEventJSONResponse } from '@/utils/liveResultat'
import { classesTestData, createTestRunners } from '@/utils/testData'

const route = useRoute()
const eventId = computed(() => parseInt(route.params.eventId as string))
const tableViewRef = ref<HTMLElement | null>(null)
const tableSizing = useTableSizingStore()
const isSettingsDisplayed = ref(false)
function setSettingsDisplayed(status?: boolean) {
  if (typeof status === 'undefined')
    isSettingsDisplayed.value = !isSettingsDisplayed.value
  else isSettingsDisplayed.value = status
}

const { data: eventData } = useQuery({
  queryKey: ['eventData'],
  queryFn: async () => {
    if (!eventId.value)
      return { name: 'TEST EVENT', organizer: 'TEST CLUB' } as EventInfo
    const response = await fetch(
      `https://liveresultat.orientering.se/api.php?method=getcompetitioninfo&comp=${eventId.value}`
    )
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    const jsonObject = await fixEventJSONResponse(response)
    return jsonObject as EventInfo
  },
})

const { status: classesStatus, data: eventClasses } = useQuery({
  queryKey: ['eventClasses'],
  queryFn: async () => {
    if (!eventId.value) return classesTestData
    const response = await fetch(
      `https://liveresultat.orientering.se/api.php?method=getclasses&comp=${eventId.value}`
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
  <EventHeader
    v-if="eventData"
    :event="eventData"
    @toggle-settings="setSettingsDisplayed"
  />
  <div ref="tableViewRef" class="font-mrb grow flex overflow-hidden p-t3 pl-3">
    <ScrollColumn
      v-if="tableSizing.isAnalyzed && classesStatus === 'success' && eventData"
    >
      <CategoryTable
        v-for="category in eventClasses"
        :key="category.id"
        :event="eventData"
        :runners="
          eventId ? undefined : createTestRunners({ gender: category.gender })
        "
        :category="category"
        class="mb-4"
      />
    </ScrollColumn>
    <CategoryTestTable
      :event="eventData"
      v-else-if="!tableSizing.isAnalyzed && eventData"
    />
    <div v-else>Loading data</div>
    <EventSettings
      v-if="isSettingsDisplayed"
      class="fixed inset-y-24 right-0 z-3"
    />
  </div>
</template>
