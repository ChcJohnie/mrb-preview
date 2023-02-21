import { createSharedComposable, useNow } from '@vueuse/core'
import { computed } from 'vue'

export const useTimeHelpers = createSharedComposable(_useTimeHelpers)

function _useTimeHelpers() {
  const timeFormatter = new Intl.DateTimeFormat('default', {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  })

  const now = useNow({ interval: 500 })
  const nowFormatted = computed(() => timeFormatter.format(now.value))

  return { timeFormatter, now, nowFormatted }
}
