export interface Category {
  id: number | string
  name: string
  length?: number
  climb?: number
  controls?: number
  gender: 'M' | 'F' | 'X'
}

export interface RawRunner {
  firstName: string
  surname: string
  si: string
  club: string
  timeM: number
  timeS: number
}

export interface RunnerWithStats {
  firstName: string
  surname: string
  si: string
  club: string
  timeM: number
  timeS: number
  rank: number
  time: string
  loss: string
}
