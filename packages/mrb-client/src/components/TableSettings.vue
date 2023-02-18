<script setup lang="ts">
import { useSettingStore } from '@/stores/settings'
const settingsStore = useSettingStore()
const { setScrollType } = settingsStore
</script>

<template>
  <div>
    <div class="inline-block bg-white border-black border-2">
      <span>SCROLL: {{ settingsStore.scrollType }}</span>
    </div>
    <div class="flex gap-3">
      <button
        class="bg-white border-black border-2"
        @click="setScrollType('page')"
      >
        Scroll by height
      </button>
      <button
        class="bg-white border-black border-2"
        @click="setScrollType('continues')"
      >
        Continues scroll
      </button>

      <button
        class="bg-white border-black border-2"
        @click="setScrollType('none')"
      >
        No scroll
      </button>
    </div>
  </div>
</template>
