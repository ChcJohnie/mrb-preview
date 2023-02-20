import { RunnerStatus } from '@/types/category'

export const fixEventJSONResponse = async (response: Response) => {
  const invalidJSONString = await response.text()
  const validJSONString = invalidJSONString
    .replaceAll('"O"', 'O')
    .replaceAll(/\t/g, '')
  const jsonObject = JSON.parse(validJSONString)
  return jsonObject
}

export const statusMap: { [lsStatus: number]: RunnerStatus } = {
  0: RunnerStatus.Ok,
  1: RunnerStatus.DidNotStart,
  2: RunnerStatus.DidNotFinish,
  3: RunnerStatus.Mispunch,
  4: RunnerStatus.Disqualified,
  5: RunnerStatus.OverMaxTime,
  9: RunnerStatus.NotStarted,
  10: RunnerStatus.NotStarted,
  11: RunnerStatus.DidNotStart,
}
