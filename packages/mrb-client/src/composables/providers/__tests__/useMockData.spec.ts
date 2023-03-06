import { ref } from 'vue'

import { useMockData } from '@/composables/providers/useMockData'
import type { Competition } from '@/types/competition'

describe('useMockData', () => {
  const TestCompetition: Competition = {
    id: 1,
    name: 'TEST EVENT',
    organizer: 'TEST CLUB',
    date: '2023-01-01',
    timediff: 0,
    categories: [
      {
        id: 1,
        name: 'TEST CATEGORY',
        gender: 'X',
        runners: [],
      },
    ],
  }

  it('should expose getCompetitionsListLoader, getCompetitionLoader and getAthletesLoader', () => {
    const { getCompetitionsLoader, getCompetitionLoader, getAthletesLoader } =
      useMockData()

    expect(getCompetitionsLoader).toBeDefined()
    expect(getCompetitionLoader).toBeDefined()
    expect(getAthletesLoader).toBeDefined()
  })

  it('getCompetitionsLoader returns test competition and status success', () => {
    const { getCompetitionsLoader } = useMockData()
    const { competitions, status } = getCompetitionsLoader()

    expect(competitions.value).toBeDefined()
    expect(competitions.value?.length).toBe(1)
    expect(competitions.value?.[0].id).toBe(1)
    expect(competitions.value?.[0].name).toBeDefined()
    expect(competitions.value?.[0].organizer).toBeDefined()
    expect(competitions.value?.[0].date).toBeDefined()
    expect(competitions.value?.[0].timediff).toBeDefined()
    expect(competitions.value?.[0].categories).toBeDefined()
    expect(status.value).toBe('success')
  })

  it('getCompetitionLoader returns undefined if no id passed', () => {
    const { getCompetitionLoader } = useMockData()
    const { competition } = getCompetitionLoader(ref(0))

    expect(competition.value).toBeUndefined()
  })

  it('getCompetitionLoader returns test competition and status success', () => {
    const { getCompetitionLoader } = useMockData()
    const { competition, status } = getCompetitionLoader(ref(1))

    expect(competition.value).toBeDefined()
    expect(competition.value?.id).toBe(1)
    expect(competition.value?.name).toBeDefined()
    expect(competition.value?.organizer).toBeDefined()
    expect(competition.value?.date).toBeDefined()
    expect(competition.value?.timediff).toBeDefined()
    expect(competition.value?.categories).toBeDefined()
    expect(status.value).toBe('success')
  })

  it('getAthletesLoader returns empty array if fetchEnabled is false', () => {
    const { getAthletesLoader } = useMockData()
    const { rawRunners, status } = getAthletesLoader({
      competition: TestCompetition,
      category: TestCompetition.categories[0],
      fetchEnabled: ref(false),
    })

    expect(rawRunners.value).toEqual([])
    expect(status.value).toEqual('loading')
  })

  it('getAthletesLoader returns runners passed in category if fetchEnabled is true', () => {
    const { getAthletesLoader } = useMockData()
    const TestAthlete = {
      firstName: 'Test',
      surname: 'Athlete',
      club: 'Test Club',
      timeM: 1,
      timeS: 1,
      status: 0,
    }
    const { rawRunners, status } = getAthletesLoader({
      competition: TestCompetition,
      category: { ...TestCompetition.categories[0], runners: [TestAthlete] },
      fetchEnabled: ref(true),
    })

    expect(rawRunners.value).toEqual([TestAthlete])
    expect(status.value).toEqual('success')
  })
})
