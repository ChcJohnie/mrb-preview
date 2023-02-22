<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import { isToday, isFuture } from 'date-fns'

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

const competitionsByPeriod = computed(() => {
  const baseObject: {
    future: Competition[]
    today: Competition[]
    past: Competition[]
  } = {
    future: [],
    today: [],
    past: [],
  }
  if (!competitionList.value) return baseObject
  const classifiedByPeriods = competitionList.value.reduce(
    (filtered, competition) => {
      const competitionDate = new Date(competition.date)
      if (isToday(competitionDate)) filtered.today.push(competition)
      else if (isFuture(competitionDate)) filtered.future.push(competition)
      else filtered.past.push(competition)
      return filtered
    },
    baseObject
  )
  classifiedByPeriods.future.sort((a, b) => (a < b ? 1 : -1)) // Sort futures from nearest to latest
  return classifiedByPeriods
})

const pagination = ref({
  past: 5,
  future: 5,
})

const paginate = (period: 'past' | 'future', full: boolean) => {
  if (full) pagination.value[period] = competitionsByPeriod.value[period].length
  else pagination.value[period] += 5
}

const competitionsPaginated = computed(() => {
  const { past, future } = pagination.value
  return {
    past: competitionsByPeriod.value.past.slice(0, past),
    future: competitionsByPeriod.value.future.slice(0, future),
  }
})
</script>

<template>
  <h2 class="text-2xl font-semibold uppercase text-header">
    Competition list (LiveResultat)
  </h2>
  <div v-if="competitionList" class="my-4">
    <section>
      <h3 class="text-xl font-bold text-header">LIVE today</h3>
      <ul>
        <li
          v-for="competition in competitionsByPeriod.today"
          :key="competition.id"
          class="py-1"
        >
          <RouterLink
            class="text-lg hover:font-bold hover:underline"
            :to="{
              name: 'event',
              params: { competitionId: competition.id },
            }"
          >
            {{ competition.name }}
          </RouterLink>
        </li>
      </ul>
    </section>

    <section class="my-4">
      <h3 class="text-xl font-bold text-header">Upcoming</h3>
      <ul>
        <li
          v-for="competition in competitionsPaginated.future"
          :key="competition.id"
          class="py-1"
        >
          <RouterLink
            class="text-lg hover:font-bold hover:underline-dashed"
            :to="{
              name: 'event',
              params: { competitionId: competition.id },
            }"
          >
            ({{ competition.date }}) {{ competition.name }}
          </RouterLink>
        </li>
      </ul>
      <div
        v-show="
          competitionsByPeriod.future.length !==
          competitionsPaginated.future.length
        "
      >
        <button
          class="text-male font-bold p-1 m-2 rounded outline outline-2 outline-male hover:font-bold hover:bg-slate-300"
          @click="() => paginate('future', false)"
        >
          Show more
        </button>
        <button
          class="text-male font-bold p-1 m-2 rounded outline outline-2 outline-male hover:font-bold hover:bg-slate-300"
          @click="() => paginate('future', true)"
        >
          Show full
        </button>
      </div>
    </section>

    <section>
      <h3 class="text-xl font-bold text-header">Past</h3>
      <ul>
        <li
          v-for="competition in competitionsPaginated.past"
          :key="competition.id"
          class="py-1"
        >
          <RouterLink
            class="text-lg hover:font-bold hover:underline-dashed"
            :to="{
              name: 'event',
              params: { competitionId: competition.id },
            }"
          >
            ({{ competition.date }}) {{ competition.name }}
          </RouterLink>
        </li>
      </ul>
      <div
        v-show="
          competitionsByPeriod.past.length !== competitionsPaginated.past.length
        "
      >
        <button
          class="text-male font-bold p-1 m-2 rounded outline outline-2 outline-male hover:font-bold hover:bg-slate-300"
          @click="() => paginate('past', false)"
        >
          Show more
        </button>
        <button
          class="text-male font-bold p-1 m-2 rounded outline outline-2 outline-male hover:font-bold hover:bg-slate-300"
          @click="() => paginate('past', true)"
        >
          Show full
        </button>
      </div>
    </section>
  </div>
  <div v-else>Loading events</div>
</template>
