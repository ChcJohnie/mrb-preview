import { ref, computed, type Ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { startOfDay } from 'date-fns'

import {
  fixEventJSONResponse,
  statusMap,
  adjustStartTimeToCET,
} from '@/utils/liveResultat'
import { getMinutesSecondsFromMilliseconds } from '@/utils/dateTime'
import type { Category, RawRunner } from '@/types/category'
import type {
  Competition,
  CompetitionWithoutCategories,
  CompetitionList,
} from '@/types/competition'

type LSCompetition = Competition & {
  date: string
}

interface LSRunner {
  name: string
  club: string
  start: number
  result: string
  status: number
}

export function useLiveResultat() {
  const getCompetitionsLoader = () => {
    const { status, data: competitions } = useQuery({
      queryKey: ['competitions'],
      queryFn: async () => {
        const response = await fetch(
          `https://liveresultat.orientering.se/api.php?method=getcompetitions`
        )
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        const jsonObject = await fixEventJSONResponse(response)
        return formatLSCompetitionsToRaw(
          jsonObject.competitions as LSCompetition[],
          true
        )
      },
    })

    return { status, competitions }
  }

  const getCompetitionLoader = (competitionId: Ref<number>) => {
    const { data: competitionData } = useQuery({
      queryKey: ['competitionData'],
      queryFn: async () => {
        if (!competitionId.value)
          return { name: 'TEST EVENT', organizer: 'TEST CLUB' } as Competition
        const response = await fetch(
          `https://liveresultat.orientering.se/api.php?method=getcompetitioninfo&comp=${competitionId.value}`
        )
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        const jsonObject = await fixEventJSONResponse(response)
        return formatLSCompetitionsToRaw(jsonObject as LSCompetition, false)
      },
    })

    const baseCompetitionLoaded = computed(
      () => competitionData.value !== undefined
    )
    const { status, data: competitionCategories } = useQuery({
      queryKey: ['competitionClasses'],
      queryFn: async () => {
        const response = await fetch(
          `https://liveresultat.orientering.se/api.php?method=getclasses&comp=${competitionId.value}`
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
      if (!competitionCategories.value || !competitionData.value)
        return undefined
      return {
        ...competitionData.value,
        categories: competitionCategories.value,
      }
    })

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
    const lastHash = ref<string>()
    const enabled = computed(() =>
      typeof fetchEnabled === 'undefined' ? true : fetchEnabled.value
    )
    const { status, data: rawRunners } = useQuery({
      queryKey: ['runners', category.id],
      queryFn: async () => {
        const response = await fetch(
          `https://liveresultat.orientering.se/api.php?comp=${
            competition.id
          }&method=getclassresults&unformattedTimes=true&class=${category.id}${
            lastHash.value ? `&last_hash=${lastHash.value}` : ''
          }`
        )
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        const res = (await response.json()) as
          | {
              results: LSRunner[]
              hash: string
            }
          | { status: 'NOT MODIFIED' }
        /*
          StructuralSharing should revert to old data when NOT MODIFIED is in response
          Must return null to trigger structuralSharing
        */
        if (!('results' in res)) {
          return null
        }
        lastHash.value = res.hash
        return formatLSRunnersToRaw(res.results, competition)
      },
      structuralSharing: (oldData, newData) => {
        if (!oldData) return newData
        if (!newData) return oldData
        return newData
      },
      enabled,
      refetchInterval: 15 * 1000,
    })

    return { status, rawRunners }
  }

  return {
    getCompetitionsLoader,
    getCompetitionLoader,
    getAthletesLoader,
  }
}

function guessGender(className: string) {
  const firstLetter = className.charAt(0)
  if (['H', 'M'].includes(firstLetter)) return 'M'
  if (['D', 'W', 'F'].includes(firstLetter)) return 'F'
  return 'X'
}

function formatLSCompetitionsToRaw(
  competition: LSCompetition | LSCompetition[],
  toArray: true
): CompetitionList
function formatLSCompetitionsToRaw(
  competition: LSCompetition | LSCompetition[],
  toArray: false
): CompetitionWithoutCategories
function formatLSCompetitionsToRaw(
  competitions: LSCompetition | LSCompetition[],
  toArray: Boolean
) {
  const _competitions = Array.isArray(competitions)
    ? competitions
    : [competitions]

  const transformed: CompetitionList = _competitions.map((competition) => ({
    ...competition,
    date: new Date(competition.date),
  }))
  return toArray ? transformed : transformed[0]
}

function formatLSRunnersToRaw(
  runners: LSRunner[],
  competition: Competition
): RawRunner[] {
  const todayStartTimeStamp = startOfDay(competition.date).valueOf()
  return runners.map((runner) => {
    const timeMS = parseFloat(runner.result) * 10
    const { minutes: timeM, seconds: timeS } =
      getMinutesSecondsFromMilliseconds(timeMS)
    const status = statusMap[runner.status]
    const startTimeMS = runner.start * 10
    const startTime = adjustStartTimeToCET(
      todayStartTimeStamp + startTimeMS,
      competition.timediff
    )
    return {
      surname: runner.name,
      firstName: '',
      club: runner.club,
      timeM,
      timeS,
      startTime,
      status,
    }
  })
}
