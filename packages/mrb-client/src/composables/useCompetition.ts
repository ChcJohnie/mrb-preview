import { inject, type Ref } from 'vue'

import { useDataProviderKey } from '@/types/providers'

export function useCompetition(id: Ref<number>) {
  const useDataProvider = inject(useDataProviderKey)
  if (!useDataProvider) throw new Error('No data provider found')

  const { getCompetitionLoader } = useDataProvider()
  const { competition, status } = getCompetitionLoader(id)

  return { competition, status }
}
