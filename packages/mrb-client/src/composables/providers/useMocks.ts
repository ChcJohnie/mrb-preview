import { ref, computed, watch, type Ref } from 'vue'

import { createTestCategories } from '@/utils/testData'
import type { Competition } from '@/types/competition'
import type { Category } from '@/types/category'

type QueryStatus = 'success' | 'loading' | 'error'

export function useTestMocks() {
  const getCompetitionLoader = (competitionId: Ref<number>) => {
    const competitionObject: Competition = {
      id: competitionId.value,
      name: 'TEST EVENT',
      organizer: 'TEST CLUB',
      date: '2023-01-01',
      timediff: 0,
      categories: createTestCategories(),
    }
    const competition = computed(() =>
      competitionId.value ? competitionObject : undefined
    )

    const status = ref<QueryStatus>('success')

    return { competition, status }
  }

  const getAthletesLoader = ({
    competition,
    category,
    fetchEnabled,
  }: {
    competition: Competition
    category: Category
    fetchEnabled: Ref<boolean>
  }) => {
    const firstFetch = ref(fetchEnabled.value)

    if (!firstFetch.value) {
      const unwatch = watch(fetchEnabled, (isEnabled) => {
        if (isEnabled) {
          firstFetch.value = true
          unwatch()
        }
      })
    }

    const rawRunners = computed(() =>
      firstFetch.value ? category.runners : []
    )

    const status = computed<QueryStatus>(() =>
      firstFetch.value ? 'success' : 'loading'
    )

    return { status, rawRunners }
  }

  return {
    getCompetitionLoader,
    getAthletesLoader,
  }
}
