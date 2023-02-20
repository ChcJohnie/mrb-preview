<script setup lang="ts">
import { computed } from 'vue'
import { useNow } from '@vueuse/core'
import type { Event } from '@/types/event'

const props = defineProps<{ event: Event }>()
const now = useNow()
const nowFormatted = computed(() =>
  new Intl.DateTimeFormat('default', {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  }).format(now.value)
)
</script>

<template>
  <h1
    class="flex justify-between gap-2.5 bg-header font-mrb font-bold text-4xl text-white p-3"
  >
    <span>{{ props.event.organizer }}</span>
    <span>{{ props.event.name }}</span>
    <span class="tabular-nums">{{ nowFormatted }}</span>
  </h1>
</template>
