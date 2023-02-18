import { ref } from 'vue'
import type { Ref } from 'vue'
import { defineStore } from 'pinia'

type ScrollType = 'none' | 'continues' | 'page'

export const useSettingStore = defineStore('settings', () => {
  const scrollType: Ref<ScrollType> = ref('none')
  function setScrollType(type: ScrollType) {
    scrollType.value = type
  }

  return { scrollType, setScrollType }
})
