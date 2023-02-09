<script setup lang="ts">
import { computed } from 'vue'
import type { Category } from '@/types/category'

const props = defineProps<{ category: Category }>()

const bgColors = {
  M: 'bg-male',
  F: 'bg-female',
  X: 'bg-neutral',
}
const categoryBackground = computed(
  () => bgColors[props.category.gender] || bgColors.X
)
</script>

<template>
  <h2
    :class="categoryBackground"
    class="sticky flex justify-between gap-2.5 top-0 rounded-lg text-white text-4xl font-bold z-2"
  >
    <span>{{ props.category.name }}</span>
    <!-- TODO Improve arrow -->
    <span
      >{{ props.category.length }} km / ↑{{ props.category.climb }} m /
      {{ props.category.controls }} k</span
    >
    <span>X / Y</span>
  </h2>
</template>
