<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useResizeObserver } from '@vueuse/core'
import { useQuery } from '@tanstack/vue-query'

import CompetitionHeader from '@/components/CompetitionHeader.vue'
import ScrollColumn from '@/components/ScrollColumn.vue'
import CategoryTable from '@/components/CategoryTable.vue'
import CategoryTestTable from '@/components/CategoryTestTable.vue'

import { useTableSizingStore } from '@/stores/tableSizing'
import type { Category } from '@/types/category'
import type { Competition } from '@/types/competition'
import { fixEventJSONResponse } from '@/utils/liveResultat'
import { classesTestData, createTestRunners } from '@/utils/testData'

const route = useRoute()
const competitionId = computed(() =>
  parseInt(route.params.competitionId as string)
)
const tableViewRef = ref<HTMLElement | null>(null)
const tableSizing = useTableSizingStore()

const { data: competitionData } = useQuery({
  queryKey: ['competitionData'],
  queryFn: async () => {
    if (!competitionId.value)
      return { name: 'TEST EVENT', organizer: 'TEST CLUB' } as Competition
    const response = await fetch(
      `https://liveresultat.orientering.se/api.php?method=getcompetitioninfo&comp=${competitionId.value}`
    )
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    const jsonObject = await fixEventJSONResponse(response)
    return jsonObject as Competition
  },
})

const { status: categoriesStatus, data: competitionCategories } = useQuery({
  queryKey: ['competitionClasses'],
  queryFn: async () => {
    if (!competitionId.value) return classesTestData
    const response = await fetch(
      `https://liveresultat.orientering.se/api.php?method=getclasses&comp=${competitionId.value}`
    )
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    const { classes: categories } = (await response.json()) as {
      classes: Array<{ className: string }>
    }
    const formatted: Category[] = categories.map((category) => ({
      id: category.className,
      name: category.className,
      gender: guessGender(category.className),
    }))
    return formatted
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
  <CompetitionHeader v-if="competitionData" :competition="competitionData" />
  <div ref="tableViewRef" class="font-mrb grow flex overflow-hidden p-t3 pl-3">
    <ScrollColumn
      v-if="
        tableSizing.isAnalyzed &&
        categoriesStatus === 'success' &&
        competitionData
      "
    >
      <CategoryTable
        v-for="category in competitionCategories"
        :key="category.id"
        :competition="competitionData"
        :runners="
          competitionId
            ? undefined
            : createTestRunners({ gender: category.gender })
        "
        :category="category"
        class="mb-4"
      />
    </ScrollColumn>
    <CategoryTestTable
      :competition="competitionData"
      v-else-if="!tableSizing.isAnalyzed && competitionData"
    />
    <div v-else>Loading data</div>
  </div>
</template>
