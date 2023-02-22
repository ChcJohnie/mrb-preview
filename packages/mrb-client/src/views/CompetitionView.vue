<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import DataProvider from '@/components/DataProvider.vue'
import CompetitionTable from '@/components/CompetitionTable.vue'
import CompetitionSettings from '@/components/CompetitionSettings.vue'

import { useSettingStore } from '@/stores/settings'

const route = useRoute()
const competitionId = computed(() =>
  route.params.competitionId
    ? parseInt(route.params.competitionId as string)
    : 1
)
const dataProvider = computed(() =>
  route.params.competitionId ? 'liveResultat' : 'test'
)

const settingsStore = useSettingStore()
</script>

<template>
  <DataProvider :provider="dataProvider">
    <CompetitionTable :competition-id="competitionId" />
  </DataProvider>
  <CompetitionSettings
    v-if="settingsStore.areSettingsDisplayed"
    class="fixed inset-y-24 right-0 z-3"
  />
</template>
