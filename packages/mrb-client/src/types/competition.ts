import type { Category } from '@/types/category'

export interface Competition {
  id: number
  name: string
  organizer: string
  date: string
  timediff: number
  categories: Category[]
}
