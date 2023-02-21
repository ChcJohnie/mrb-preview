<script setup lang="ts">
import { ref, computed, inject, onMounted } from 'vue'
import { useElementVisibility } from '@vueuse/core'

import TableHeader from './CategoryTableHeader.vue'
import TableFinishedRow from './CategoryTableFinishedRow.vue'
import TableUnfinishedRow from './CategoryTableUnfinishedRow.vue'

import {
  useAthletes,
  useUnfinishedAthletes,
  useFinishedAthletes,
} from '@/composables/useAthletes'

import { addScrollTableElementKey } from '@/types/providers'
import type { Category } from '@/types/category'
import type { Competition } from '@/types/competition'

const props = defineProps<{
  competition: Competition
  category: Category
}>()

const tableRef = ref<HTMLElement | null>(null)
const addScrollTable = inject(addScrollTableElementKey)
const visibilityTarget = inject('TableVisibilityTarget', null)
// TODO Adjust VueUse version to allow bottom margin so one page below fold is 'visible'
const isElementVisible = useElementVisibility(tableRef, {
  scrollTarget: visibilityTarget,
})

const { status, athletes, areAvailable } = useAthletes({
  competition: props.competition,
  category: props.category,
  fetchEnabled: isElementVisible,
})

const athletesCount = computed(() => {
  return {
    finished: athletes.value.finished.length,
    unfinished: athletes.value.unfinished.length,
    full: athletes.value.finished.length + athletes.value.unfinished.length,
  }
})
const finishedAthletes = useFinishedAthletes(athletes)
const unfinishedAthletes = useUnfinishedAthletes(athletes)

onMounted(() => {
  if (addScrollTable && tableRef.value) addScrollTable(ref(tableRef.value))
})
</script>

<template>
  <div ref="tableRef">
    <TableHeader
      class="p-3"
      :category="props.category"
      :athletes-count="athletesCount"
    />
    <!-- TODO Add 2rem text class -->
    <div
      v-if="status === 'success' && areAvailable"
      class="w-full text-3xl font-bold bg-white"
    >
      <TableFinishedRow
        v-if="finishedAthletes.firstRow"
        :data="finishedAthletes.firstRow"
        :is-even="false"
        class="sticky top-16"
      >
      </TableFinishedRow>
      <TableFinishedRow
        v-for="(row, index) in finishedAthletes.restRows"
        :data="row"
        :key="row.rank"
        :is-even="index % 2 === 0"
      >
      </TableFinishedRow>
      <TableUnfinishedRow
        v-for="(row, index) in unfinishedAthletes"
        :data="row"
        :key="index"
        :is-even="index % 2 === 0"
        :is-visible="isElementVisible"
      >
      </TableUnfinishedRow>
    </div>
  </div>
</template>
