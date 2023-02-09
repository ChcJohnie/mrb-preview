<script setup lang="ts">
import type { Category } from '@/types/category'

const props = defineProps<{ category: Category }>()
</script>

<template>
  <h2 class="sticky top-0 bg-white text-4xl font-bold z-2">
    {{ props.category.name }}
  </h2>
</template>
