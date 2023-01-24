<script setup lang="ts">
export interface RunnerData {
  rank: number
  name: string
  time: string
}

defineProps<{ data: RunnerData }>()
</script>

<template>
  <tr class="bg-white w-full">
    <td>{{ data.rank }}</td>
    <td>{{ data.name }}</td>
    <td>{{ data.time }}</td>
  </tr>
</template>
