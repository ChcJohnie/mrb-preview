import { inject, computed } from 'vue'
import { isToday, isFuture } from 'date-fns'

import { useDataProviderKey } from '@/types/providers'
import type { CompetitionList } from '@/types/competition'

export function useCompetitions() {
  const useDataProvider = inject(useDataProviderKey)
  if (!useDataProvider) throw new Error('No data provider found')

  const { getCompetitionsLoader } = useDataProvider()
  const { competitions, status } = getCompetitionsLoader()

  const competitionsByPeriod = computed(() => {
    const baseObject: {
      future: CompetitionList
      today: CompetitionList
      past: CompetitionList
    } = {
      future: [],
      today: [],
      past: [],
    }
    if (!competitions.value) return baseObject
    const classifiedByPeriods = competitions.value.reduce(
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
    classifiedByPeriods.past.sort((a, b) => (a > b ? 1 : -1)) // Sort futures from nearest to latest
    return classifiedByPeriods
  })

  return { competitions, competitionsByPeriod, status }
}
