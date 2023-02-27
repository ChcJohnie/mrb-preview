import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

type ScrollType = 'none' | 'continues' | 'page'

export const useSettingStore = defineStore('settings', () => {
  const areSettingsDisplayed = ref(false)
  function setSettingsDisplayed(status?: boolean) {
    if (typeof status === 'undefined')
      areSettingsDisplayed.value = !areSettingsDisplayed.value
    else areSettingsDisplayed.value = status
  }

  const scrollType = ref<ScrollType>('page')
  const readLineTimeSeconds = ref(import.meta.env.PROD ? 1 : 0.2)
  const readLineTimeMS = computed(() => readLineTimeSeconds.value * 1000)
  function setScrollType(type: ScrollType) {
    scrollType.value = type
  }

  const showUnfinishedRunners = ref(true)

  const availableCategories = ref<string[]>([])
  const selectedCategories = ref<string[]>([])
  const setAvailableCategories = (categories: string[]) => {
    availableCategories.value = categories
    selectedCategories.value = categories
  }

  return {
    areSettingsDisplayed,
    setSettingsDisplayed,

    scrollType,
    readLineTimeSeconds,
    readLineTimeMS,
    setScrollType,

    showUnfinishedRunners,
    availableCategories,
    selectedCategories,
    setAvailableCategories,
  }
})
