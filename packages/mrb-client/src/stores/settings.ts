import { ref, computed } from 'vue'
import type { Ref } from 'vue'
import { defineStore } from 'pinia'

type ScrollType = 'none' | 'continues' | 'page'

export const useSettingStore = defineStore('settings', () => {
  const scrollType: Ref<ScrollType> = ref('none')
  const readLineTimeSeconds = ref(0.2)
  const readLineTimeMS = computed(() => readLineTimeSeconds.value * 1000)
  function setScrollType(type: ScrollType) {
    scrollType.value = type
  }

  return { scrollType, readLineTimeMS, setScrollType }
})
