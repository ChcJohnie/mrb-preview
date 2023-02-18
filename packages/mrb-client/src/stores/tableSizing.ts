import { ref, computed } from 'vue'
import { refDebounced } from '@vueuse/core'
import { defineStore } from 'pinia'

export const useTableSizingStore = defineStore('tableSizing', () => {
  const tableViewHeight = ref(0)
  const lineHeight = ref(0)
  const headerHeight = ref(0)

  const areParamsSet = computed(
    () =>
      tableViewHeight.value > 0 &&
      lineHeight.value > 0 &&
      headerHeight.value > 0
  )

  const _isAnalyzed = ref(false)
  const isAnalyzed = refDebounced(_isAnalyzed, 100)

  function setAnalyzed(status: boolean) {
    if (status === _isAnalyzed.value) return
    if (status && areParamsSet.value) {
      _isAnalyzed.value = true
    } else if (!status) {
      tableViewHeight.value = 0
      lineHeight.value = 0
      headerHeight.value = 0
      _isAnalyzed.value = false
    }
  }

  return { isAnalyzed, tableViewHeight, lineHeight, headerHeight, setAnalyzed }
})
