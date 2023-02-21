<script setup lang="ts">
import CompetitionTable from '@/components/CompetitionTable.vue'
import CompetitionSettings from '@/components/CompetitionSettings.vue'

import { useSettingStore } from '@/stores/settings'
const settingsStore = useSettingStore()
</script>

<template>
  <CompetitionTable />
  <CompetitionSettings
    v-if="settingsStore.areSettingsDisplayed"
    class="fixed inset-y-24 right-0 z-3"
  />
</template>
