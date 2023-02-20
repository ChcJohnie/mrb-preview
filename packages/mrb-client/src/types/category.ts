export interface Category {
  id: number | string
  name: string
  length?: number
  climb?: number
  controls?: number
  gender: 'M' | 'F' | 'X'
}

export interface LSRunner {
  name: string
  club: string
  result: string
  status: number
}

export enum RunnerStatus {
  Ok = 1,
  NotCompeting,
  OverMaxTime,
  DidNotFinish,
  Mispunch,
  Disqualified,
  DidNotStart,
  Running,
  NotStarted,
}

export interface RawRunner {
  firstName: string
  surname: string
  si?: string
  club: string
  timeM: number
  timeS: number
  status: RunnerStatus
}

export interface RunnerWithStats extends RawRunner {
  rank?: number
  time?: string
  loss?: string
}
