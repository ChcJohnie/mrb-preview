import { ref, computed } from 'vue'
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

  const isAnalyzed = ref(false)

  function setAnalyzed(status: boolean) {
    if (status === isAnalyzed.value) return
    if (status && areParamsSet.value) {
      isAnalyzed.value = true
    } else if (!status) {
      tableViewHeight.value = 0
      lineHeight.value = 0
      headerHeight.value = 0
      isAnalyzed.value = false
    }
  }

  return { isAnalyzed, tableViewHeight, lineHeight, headerHeight, setAnalyzed }
})
