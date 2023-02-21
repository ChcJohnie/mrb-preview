<script setup lang="ts">
import { useSettingStore } from '@/stores/settings'
const settingsStore = useSettingStore()
</script>

<template>
  <div
    class="overflow-hidden shadow-lg border-t-4 bg-white mb-4 rounded-l-lg rounded-t border-header w-full md:w-1/4"
  >
    <div class="px-6 py-4 mt-4 mb-8">
      <h3>Result table settings</h3>
      <form>
        <div class="mb-6">
          <h4>(Auto) Scrolling</h4>
          <div class="flex items-center mb-2">
            <input
              v-model="settingsStore.scrollType"
              id="scroll-page"
              type="radio"
              value="page"
              name="scroll by page"
              class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label
              for="scroll-page"
              class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
              >Scroll by page</label
            >
          </div>
          <div class="flex items-center mb-2">
            <input
              v-model="settingsStore.scrollType"
              id="scroll-continues"
              type="radio"
              value="continues"
              name="scroll continuesly"
              class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label
              for="scroll-continues"
              class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
              >Continues scroll</label
            >
          </div>
          <div class="flex items-center mb-2">
            <input
              v-model="settingsStore.scrollType"
              id="scroll-none"
              type="radio"
              value="none"
              name="scroll manually"
              class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label
              for="scroll-none"
              class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
              >Manual scroll</label
            >
          </div>

          <h4>Scroll speed (time per result line)</h4>
          <div class="flex items-center mb-2">
            <label
              for="scroll-speed"
              class="block mb-1 mr-2 text-sm font-medium text-gray-900 dark:text-white"
              >{{ settingsStore.readLineTimeSeconds }}s</label
            >
            <input
              v-model="settingsStore.readLineTimeSeconds"
              id="scroll-speed"
              type="range"
              min="0.1"
              max="2"
              step="0.1"
              class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
          </div>
        </div>
      </form>
    </div>
  </div>
</template>
