<script setup lang="ts">
import { ref, toRefs } from 'vue'
import { useResizeObserver } from '@vueuse/core'

import CompetitionHeader from '@/components/CompetitionHeader.vue'
import ScrollColumn from '@/components/ScrollColumn.vue'
import CategoryTable from '@/components/CategoryTable.vue'
import CategoryTestTable from '@/components/CategoryTestTable.vue'

import { useCompetition } from '@/composables/useCompetition'
import { useTableSizingStore } from '@/stores/tableSizing'

const props = defineProps<{
  competitionId: number
}>()
const { competitionId } = toRefs(props)
const { competition, status } = useCompetition(competitionId)

const tableViewRef = ref<HTMLElement | null>(null)
const tableSizing = useTableSizingStore()

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
  <CompetitionHeader v-if="competition" :competition="competition" />
  <div ref="tableViewRef" class="font-mrb grow flex overflow-hidden p-t3 pl-3">
    <ScrollColumn
      v-if="tableSizing.isAnalyzed && status === 'success' && competition"
    >
      <CategoryTable
        v-for="category in competition.categories"
        :key="category.id"
        :competition="competition"
        :category="category"
        class="mb-4"
      />
    </ScrollColumn>
    <CategoryTestTable
      :competition="competition"
      v-else-if="!tableSizing.isAnalyzed && competition"
    />
    <div v-else>Loading data</div>
  </div>
</template>
