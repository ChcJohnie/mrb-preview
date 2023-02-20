<script setup lang="ts">
import { useSettingStore } from '@/stores/settings'
const settingsStore = useSettingStore()
const { setScrollType } = settingsStore
</script>

<template>
  <div
    class="overflow-hidden shadow-lg border-t-4 bg-white mb-4 rounded-l-lg rounded-t border-header w-full md:w-1/4"
  >
    <div class="px-6 py-4 mt-4 mb-8">
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
  </div>
</template>
