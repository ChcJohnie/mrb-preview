import type { Category } from '@/types/category'

export interface Competition {
  id: number
  name: string
  organizer: string
  date: string
  timediff: number
  categories: Category[]
}

export type CompetitionWithoutCategories = Omit<Competition, 'categories'>
export type CompetitionList = CompetitionWithoutCategories[]
