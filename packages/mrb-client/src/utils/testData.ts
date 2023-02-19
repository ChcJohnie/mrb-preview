import type { Category, RawRunner } from '@/types/category'

export const classesTestData: Category[] = [
  {
    id: 1,
    name: 'H21C',
    length: 10.2,
    climb: 255,
    controls: 20,
    gender: 'M',
  },
  {
    id: 2,
    name: 'D21C',
    length: 8.2,
    climb: 150,
    controls: 16,
    gender: 'F',
  },
  {
    id: 3,
    name: 'HDR',
    length: 10.2,
    climb: 255,
    controls: 20,
    gender: 'X',
  },
  {
    id: 4,
    name: 'JKL',
    length: 10.2,
    climb: 255,
    controls: 20,
    gender: 'M',
  },
  {
    id: 5,
    name: 'MNO',
    length: 10.2,
    climb: 255,
    controls: 20,
    gender: 'M',
  },
  {
    id: 6,
    name: 'PQR',
    length: 10.2,
    climb: 255,
    controls: 20,
    gender: 'M',
  },
]

const getRandomTime = () => {
  const timeM = Math.floor(Math.random() * 35) + 35
  const timeS = Math.floor(Math.random() * 60)
  return { timeM, timeS }
}

export const createTestRunner = (gender?: string): RawRunner => ({
  surname: 'Doe',
  firstName: gender === 'F' ? 'Jane' : 'Joe',
  si: '81234567',
  club: 'Czech republic',
  ...getRandomTime(),
})

export const createTestRunners = ({
  gender,
  count,
}: {
  gender?: string
  count?: number
}): RawRunner[] => {
  const runnersCount = count || Math.floor(Math.random() * 20) + 10
  return new Array(runnersCount).fill({}).map(() => createTestRunner(gender))
}
