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

defineProps<{ data: RunnerData }>()
</script>

<template>
  <tr class="bg-white w-full">
    <td>{{ data.rank }}.</td>
    <td>{{ data.surname }} {{ data.firstName }}</td>
    <td>{{ data.si }}</td>
    <td>{{ data.club }}</td>
    <td>{{ data.time }}</td>
    <td>+ {{ data.loss }}</td>
  </tr>
</template>
