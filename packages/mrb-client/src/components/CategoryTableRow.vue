<script setup lang="ts">
export interface RunnerData {
  rank: number
  firstName: string
  surname: string
  si: string
  club: string
  time: string
  loss: string
}

const props = defineProps<{ data: RunnerData; isEven: Boolean }>()

const bgColor = props.isEven ? 'bg-even' : 'bg-white'
</script>

<template>
  <div
    :class="bgColor"
    class="grid grid-flow-col auto-cols-fr px-3 py-1.5 rounded-lg"
  >
    <span>{{ data.rank }}.</span>
    <span>{{ data.surname }} {{ data.firstName }}</span>
    <span>{{ data.si }}</span>
    <span>{{ data.club }}</span>
    <span>{{ data.time }}</span>
    <span v-if="data.loss">+ {{ data.loss }}</span>
    <span v-else></span>
  </div>
</template>
