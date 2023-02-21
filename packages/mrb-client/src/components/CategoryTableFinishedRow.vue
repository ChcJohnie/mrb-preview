<script setup lang="ts">
import { RunnerStatus } from '@/types/category'
import type { RunnerWithStats } from '@/types/category'

const props = defineProps<{ data: RunnerWithStats; isEven: Boolean }>()

const bgColor = props.isEven ? 'bg-even' : 'bg-white'
</script>

<template>
  <div
    :class="bgColor"
    class="grid table-row-grid gap-2 px-3 py-1.5 rounded-lg"
  >
    <span v-if="data.rank" class="tabular-nums">{{ data.rank }}.</span>
    <span v-else></span>
    <span>{{ data.surname }} {{ data.firstName }}</span>
    <span>{{ data.si }}</span>
    <span>{{ data.club }}</span>
    <!-- TODO tabular-nums not nice override, special monospace font? -->
    <span
      class="text-right tabular-nums"
      v-if="data.status === RunnerStatus.Ok"
      >{{ data.time }}</span
    >
    <span class="text-right" v-else>{{ RunnerStatus[data.status] }}</span>
    <span class="text-right tabular-nums" v-if="data.loss"
      >+ {{ data.loss }}</span
    >
    <span v-else></span>
  </div>
</template>

<style>
.table-row-grid {
  grid-template-columns: 2em 3fr 1fr 3fr 7em 5em;
}
</style>
