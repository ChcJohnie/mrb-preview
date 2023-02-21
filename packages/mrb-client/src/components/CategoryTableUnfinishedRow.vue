<script setup lang="ts">
import { computed } from 'vue'

import { useTimeHelpers } from '@/composables/useTimeHelpers'
import { RunnerStatus } from '@/types/category'
import type { RunnerWithStats } from '@/types/category'
import {
  getMinutesSecondsFromMilliseconds,
  formatMinutesSeconds,
} from '@/utils/dateTime'

const props = defineProps<{
  data: RunnerWithStats
  isEven: Boolean
  isVisible: Boolean
}>()

const bgColor = props.isEven ? 'bg-even' : 'bg-white'
const { now, timeFormatter } = useTimeHelpers()

const isRunning = computed(() =>
  props.data.startTime
    ? props.data.startTime < now.value.valueOf()
    : props.data.status === RunnerStatus.Running
)

const startTimeFormatted = computed(() =>
  timeFormatter.format(props.data.startTime)
)

const timeRunning = computed(() => {
  if (!props.data.startTime || !isRunning.value) return ''
  const time = now.value.valueOf() - props.data.startTime
  const { minutes, seconds } = getMinutesSecondsFromMilliseconds(time)
  return formatMinutesSeconds(minutes, seconds)
})
</script>

<template>
  <div
    :class="bgColor"
    class="grid table-row-grid gap-2 px-3 py-1.5 rounded-lg"
  >
    <span></span>
    <span>{{ data.surname }} {{ data.firstName }}</span>
    <span>{{ data.si }}</span>
    <span>{{ data.club }}</span>
    <!-- TODO tabular-nums not nice override, special monospace font? -->
    <span class="text-right tabular-nums" v-if="isRunning && isVisible"
      >( {{ timeRunning }} )</span
    >
    <span class="text-right tabular-nums" v-else-if="!isRunning">{{
      startTimeFormatted
    }}</span>
    <span v-else></span>
    <span></span>
  </div>
</template>

<style>
.table-row-grid {
  grid-template-columns: 2em 3fr 1fr 3fr 7em 5em;
}
</style>
