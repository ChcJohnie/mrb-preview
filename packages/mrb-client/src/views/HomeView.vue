<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import { isToday } from 'date-fns'

import { fixEventJSONResponse } from '@/utils/liveResultat'
import type { EventInfo } from '@/types/event'

const { data: eventList } = useQuery({
  queryKey: ['eventList'],
  queryFn: async () => {
    const response = await fetch(
      `https://liveresultat.orientering.se/api.php?method=getcompetitions`
    )
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    const jsonObject = await fixEventJSONResponse(response)
    return jsonObject.competitions as EventInfo[]
  },
})

const todayEvents = computed(() => {
  if (!eventList.value) return []
  return eventList.value.filter((event) => isToday(new Date(event.date)))
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
    <div v-if="eventList" class="wrapper">
      <h2>Choose event</h2>
      <ul>
        <li v-for="event in todayEvents" :key="event.id">
          <RouterLink :to="{ name: 'event', params: { eventId: event.id } }">
            {{ event.name }}
          </RouterLink>
        </li>
      </ul>
    </div>
    <div v-else>Loading events</div>
  </main>
</template>
