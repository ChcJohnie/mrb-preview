import { ref, computed } from 'vue'
import type { Ref } from 'vue'
import { defineStore } from 'pinia'

type ScrollType = 'none' | 'continues' | 'page'

export const useSettingStore = defineStore('settings', () => {
  const areSettingsDisplayed = ref(false)
  function setSettingsDisplayed(status?: boolean) {
    if (typeof status === 'undefined')
      areSettingsDisplayed.value = !areSettingsDisplayed.value
    else areSettingsDisplayed.value = status
  }

  const scrollType: Ref<ScrollType> = ref('page')
  const readLineTimeSeconds = ref(import.meta.env.PROD ? 1 : 0.2)
  const readLineTimeMS = computed(() => readLineTimeSeconds.value * 1000)
  function setScrollType(type: ScrollType) {
    scrollType.value = type
  }

  return {
    areSettingsDisplayed,
    setSettingsDisplayed,

    scrollType,
    readLineTimeSeconds,
    readLineTimeMS,
    setScrollType,
  }
})
