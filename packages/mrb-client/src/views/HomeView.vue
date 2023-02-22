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
  <div class="grid home-layout gap-y-10 font-mrb">
    <header class="header text-center mt-10">
      <h1 class="text-4xl font-bold">
        <span class="text-header">My</span
        ><span class="text-female">Result</span
        ><span class="text-male">Board</span>
      </h1>
      <p class="text-xl capitalize">Technology Preview</p>
      <p class="mt-6 text-3xl font-semibold">
        Orienteering competitions result board
      </p>
    </header>
    <main
      class="competition-list w-140 justify-self-center lg:justify-self-end lg:pr-4 lg:border-r-3 lg:border-female"
    >
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
              competitionsByPeriod.past.length !==
              competitionsPaginated.past.length
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
    </main>
    <section class="about flex flex-col gap-4 w-140 text-lg lg:pl-8">
      <h2 class="text-2xl font-semibold uppercase text-header">About MRB</h2>
      <p>
        MyResultBoard is competition result presentation system intended for use
        on result screens in the competition centre. MRB is created by
        orienteering runners for orienteering events but should be modular and
        easily extensible for other time-based sports.
      </p>
      <p>
        This Preview version offers a basic result board on top of LiveResultat
        API with limited functionality and configuration. Still as is, it should
        be possible to display orienteering event results. The full version
        shall be released in the future.
      </p>
      <p>Upcoming features may include:</p>
      <ul class="list-disc list-inside">
        <li>persistent competition settings (local or online)</li>
        <li>multiple competition data providers</li>
        <li>multiple columns support</li>
        <li>multi screen/device synchronization (settings/takeover mode)</li>
        <li>relay mode</li>
        <li>richer data content options</li>
        <li>and many more</li>
      </ul>
      <p>
        Its recommended to use Chrome as browser. StartTimes and LiveTime
        calculation (if available for competition) might be off out of CET time
        zone (known bug which shall be fixed in future release)
      </p>
    </section>
    <footer class="footer text-center text-xl bg-slate-300 p-10">
      <h2>@MyResultBoard - Contact us</h2>
      <a href="https://github.com/ChcJohnie/myresultboard2"
        ><span class="i-mdi-github">GitHub</span></a
      >
    </footer>
  </div>
</template>

<style scoped>
.header {
  grid-area: header;
}
.competition-list {
  grid-area: main;
}
.about {
  grid-area: about;
}
.footer {
  grid-area: footer;
}

.home-layout {
  grid-template-areas:
    'header'
    'main'
    'about'
    'footer';
}

@media (min-width: 1024px) {
  .home-layout {
    grid-template-columns: 1fr 1fr;
    grid-template-areas:
      'header   header'
      'main     about'
      'footer   footer';
  }
}
</style>
