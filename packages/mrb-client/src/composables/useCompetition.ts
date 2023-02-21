import { computed, type Ref } from 'vue'

import { useQuery } from '@tanstack/vue-query'

import type { Category } from '@/types/category'
import type { Competition } from '@/types/competition'
import { fixEventJSONResponse } from '@/utils/liveResultat'
import { createTestCategories } from '@/utils/testData'

type CompetitionWithoutCategories = Omit<Competition, 'categories'>

export function useCompetition(id: Ref<number>) {
  const { data: competitionData } = useQuery({
    queryKey: ['competitionData'],
    queryFn: async () => {
      if (!id.value)
        return { name: 'TEST EVENT', organizer: 'TEST CLUB' } as Competition
      const response = await fetch(
        `https://liveresultat.orientering.se/api.php?method=getcompetitioninfo&comp=${id.value}`
      )
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      const jsonObject = await fixEventJSONResponse(response)
      return jsonObject as CompetitionWithoutCategories
    },
  })

  const baseCompetitionLoaded = computed(
    () => competitionData.value !== undefined
  )
  const { status, data: competitionCategories } = useQuery({
    queryKey: ['competitionClasses'],
    queryFn: async () => {
      if (!id.value) return createTestCategories()
      const response = await fetch(
        `https://liveresultat.orientering.se/api.php?method=getclasses&comp=${id.value}`
      )
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      const { classes: categories } = (await response.json()) as {
        classes: Array<{ className: string }>
      }
      const formatted: Category[] = categories.map((category) => ({
        id: category.className,
        name: category.className,
        gender: guessGender(category.className),
      }))
      return formatted
    },
    enabled: baseCompetitionLoaded,
  })

  const competition = computed((): Competition | undefined => {
    if (!competitionCategories.value || !competitionData.value) return undefined
    return {
      ...competitionData.value,
      categories: competitionCategories.value,
    }
  })

  function guessGender(className: string) {
    const firstLetter = className.charAt(0)
    if (['H', 'M'].includes(firstLetter)) return 'M'
    if (['D', 'W', 'F'].includes(firstLetter)) return 'F'
    return 'X'
  }

  return { competition, status }
}
