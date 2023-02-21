<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import { isToday } from 'date-fns'

import { fixEventJSONResponse } from '@/utils/liveResultat'
import type { Competition } from '@/types/competition'

const { data: competitionList } = useQuery({
  queryKey: ['competitionList'],
  queryFn: async () => {
    const response = await fetch(
      `https://liveresultat.orientering.se/api.php?method=getcompetitions`
    )
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    const jsonObject = await fixEventJSONResponse(response)
    return jsonObject.competitions as Competition[]
  },
})

const todayCompetitions = computed(() => {
  if (!competitionList.value) return []
  return competitionList.value.filter((competition) =>
    isToday(new Date(competition.date))
  )
})
</script>

<template>
  <header>
    <div class="wrapper">
      <h1>My result board</h1>

      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/event">Table</RouterLink>
      </nav>
    </div>
  </header>
  <main>
    <div v-if="competitionList" class="wrapper">
      <h2>Choose event</h2>
      <ul>
        <li v-for="competition in todayCompetitions" :key="competition.id">
          <RouterLink
            :to="{
              name: 'event',
              params: { competitionId: competition.id },
            }"
          >
            {{ competition.name }}
          </RouterLink>
        </li>
      </ul>
    </div>
    <div v-else>Loading events</div>
  </main>
</template>
