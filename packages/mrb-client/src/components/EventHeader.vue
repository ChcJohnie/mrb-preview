<script setup lang="ts">
import { computed, ref } from 'vue'
import { useNow } from '@vueuse/core'
import type { EventInfo } from '@/types/event'

const props = defineProps<{ event: EventInfo }>()
defineEmits(['toggleSettings'])

const now = useNow()
const nowFormatted = computed(() =>
  new Intl.DateTimeFormat('default', {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  }).format(now.value)
)

const isToolbarDisplayed = ref(false)
</script>

<template>
  <h1
    class="flex justify-between gap-2.5 bg-header font-mrb font-bold text-4xl text-white p-3"
    @mouseenter="isToolbarDisplayed = true"
    @mouseleave="isToolbarDisplayed = false"
  >
    <span>{{ props.event.organizer }}</span>
    <span>{{ props.event.name }}</span>
    <span class="tabular-nums">{{ nowFormatted }}</span>
    <div v-if="isToolbarDisplayed" class="absolute right-3 z-2 bg-header">
      <RouterLink to="/">Home</RouterLink>
      <button @click="$emit('toggleSettings')" class="ml-3 i-mdi-cog"></button>
    </div>
  </h1>
</template>
