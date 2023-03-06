<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'

import { useCompetitions } from '@/composables/useCompetitions'

const { competitions, competitionsByPeriod } = useCompetitions()

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
  <div v-if="competitions" class="my-4">
    <section data-testId="competitions-today">
      <h3 class="text-xl font-bold text-header">LIVE today</h3>
      <ul>
        <li
          v-for="competition in competitionsByPeriod.today"
          :key="competition.id"
          class="py-1"
        >
          <RouterLink
            data-testId="competition-link"
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

    <section class="my-4" data-testId="competitions-future">
      <h3 class="text-xl font-bold text-header">Upcoming</h3>
      <ul>
        <li
          v-for="competition in competitionsPaginated.future"
          :key="competition.id"
          class="py-1"
        >
          <RouterLink
            data-testId="competition-link"
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

    <section data-testId="competitions-past">
      <h3 class="text-xl font-bold text-header">Past</h3>
      <ul>
        <li
          v-for="competition in competitionsPaginated.past"
          :key="competition.id"
          class="py-1"
        >
          <RouterLink
            data-testId="competition-link"
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
