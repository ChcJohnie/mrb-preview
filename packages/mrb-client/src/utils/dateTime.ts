export const getMinutesSecondsFromMilliseconds = (milliseconds: number) => {
  const minutes = Math.floor(milliseconds / 60000)
  const seconds = Math.floor((milliseconds - minutes * 60000) / 1000)
  return { minutes, seconds }
}

export const formatMinutesSeconds = (minutes: number, seconds: number) => {
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
}
