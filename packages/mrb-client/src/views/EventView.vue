<script setup lang="ts">
import EventTable from '@/components/EventTable.vue'
import EventSettings from '@/components/EventSettings.vue'

import { useSettingStore } from '@/stores/settings'
const settingsStore = useSettingStore()
</script>

<template>
  <EventTable />
  <EventSettings
    v-if="settingsStore.areSettingsDisplayed"
    class="fixed inset-y-24 right-0 z-3"
  />
</template>
