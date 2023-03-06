import { ref, computed, watch, type Ref } from 'vue'

import { createTestCategories } from '@/utils/testData'
import type {
  Competition,
  CompetitionWithoutCategories,
  CompetitionList,
} from '@/types/competition'
import type { Category } from '@/types/category'

type QueryStatus = 'success' | 'loading' | 'error'

export const DEFAULT_TEST_SIMPLE_COMPETITION: CompetitionWithoutCategories = {
  id: 1,
  name: 'TEST EVENT',
  organizer: 'TEST CLUB',
  date: '2023-01-01',
  timediff: 0,
}

export const DEFAULT_TEST_COMPETITION: Competition = {
  ...DEFAULT_TEST_SIMPLE_COMPETITION,
  categories: createTestCategories(),
}

export function useMockData({
  MOCK_COMPETION_LIST,
}: { MOCK_COMPETION_LIST?: CompetitionList } = {}) {
  const getCompetitionsLoader = () => {
    const competitions = computed(
      () => MOCK_COMPETION_LIST ?? [DEFAULT_TEST_COMPETITION]
    )
    const status = ref<QueryStatus>('success')

    return { competitions, status }
  }

  const getCompetitionLoader = (competitionId: Ref<number>) => {
    const competitionObject: Competition = {
      ...DEFAULT_TEST_COMPETITION,
      id: competitionId.value,
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
    getCompetitionsLoader,
    getCompetitionLoader,
    getAthletesLoader,
  }
}
