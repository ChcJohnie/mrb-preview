<script lang="ts" setup>
import { provide, ref, unref, watch, computed } from 'vue'
import type { Ref } from 'vue'

import { useSettingStore } from '@/stores/settings'
import { addScrollTableElementKey } from '@/types/providers'
import type { AddScrollTableElementFn } from '@/types/providers'

let activeScroll: null | Function = null
const settingsStore = useSettingStore()
const columnWrapper = ref<HTMLElement | null>(null)
const columnContent = ref<HTMLElement | null>(null)
const columnRect = computed(() => {
  if (!columnWrapper.value) return { top: 0, height: 100, bottom: 100 } // Placeholder until columnWrapper is set
  return columnWrapper.value.getBoundingClientRect()
})

const tableRefsRegistry: Ref<HTMLElement>[] = []
const registerTableElement: AddScrollTableElementFn = (component) =>
  tableRefsRegistry.push(component)
provide(addScrollTableElementKey, registerTableElement)

function logSlots() {
  console.log(tableRefsRegistry)
}
window.setTimeout(logSlots, 1000)

function isColumnBottom() {
  if (!columnContent.value) return true
  return isFullyDisplayed(columnContent.value)
}

function scrollColumnToTop() {
  columnWrapper.value?.scrollTo({ top: 0, behavior: 'smooth' })
}

// find last visible table
function findLastVisibleTable() {
  return tableRefsRegistry
    .slice()
    .reverse()
    .find((table) => {
      const rect = table.value.getBoundingClientRect()
      // console.log(rect)
      return (
        rect.top < columnRect.value.top + columnRect.value.height &&
        rect.bottom > columnRect.value.top
      )
    })
}

function isFullyDisplayed(table: Ref<HTMLElement> | HTMLElement) {
  const tableElement = unref(table)
  const rect = tableElement.getBoundingClientRect()
  const bottomMargin = rootFontSizePx
  const tablePxRemaining = rect.bottom - columnRect.value.bottom
  return Math.floor(tablePxRemaining) <= bottomMargin
}

const STICKY_HEADER_REMS = 4.5
const rootFontSize = window.getComputedStyle(document.documentElement).fontSize
const rootFontSizePx = parseInt(rootFontSize.slice(0, -2))

function scrollDownByHeight() {
  const wHeight = columnRect.value.height
  const lastTable = findLastVisibleTable()
  const heightSubtract =
    lastTable && isFullyDisplayed(lastTable)
      ? 0
      : STICKY_HEADER_REMS * rootFontSizePx
  const height = wHeight - heightSubtract
  if (height) columnWrapper.value?.scrollBy({ top: height, behavior: 'smooth' })
  // TODO Lessen scroll y if for last newly visible table only heading will be visible
}

function scrollByPage() {
  if (isColumnBottom()) scrollColumnToTop()
  else scrollDownByHeight()
}

function setupPageScroll() {
  const scrollNumber = window.setInterval(scrollByPage, 2000)
  const cancel = () => window.clearInterval(scrollNumber)
  return cancel
}

watch(
  () => settingsStore.scrollType,
  (type) => {
    if (activeScroll) {
      activeScroll()
      activeScroll = null
    }
    if (columnWrapper.value === null || columnContent.value === null) return
    if (type === 'none') return
    if (type === 'page') {
      activeScroll = setupPageScroll()
    }
    if (type === 'continues') activeScroll = setupContinuesScroll()
  },
  { immediate: true }
)
/*

Page scroll

Interval

  IsBottom ?
    ScrollByPage
    ScrollToTop

*/

function setupContinuesScroll() {
  const isCancelled = ref(false)
  const cancel = () => (isCancelled.value = true)
  scrollContinuously(isCancelled)
  return cancel
}

function scrollContinuously(isCancelled: Ref<Boolean>) {
  const duration = 20 * 1000
  if (columnWrapper.value === null) return
  if (columnContent.value === null) return
  const wrapperRect = columnWrapper.value.getBoundingClientRect()
  const contentRect = columnContent.value.getBoundingClientRect()
  const scrollLength =
    contentRect.bottom - (wrapperRect.height + wrapperRect.top)

  const startPos = wrapperRect.top - contentRect.top
  const diff = scrollLength

  let startTime: number | null = null
  let requestId: number | null

  const loop = function (currentTime: DOMHighResTimeStamp) {
    if (isCancelled.value) {
      if (requestId) window.cancelAnimationFrame(requestId)
      return
    }
    if (!startTime) {
      startTime = currentTime
    }

    // Elapsed time in miliseconds
    const time = currentTime - startTime

    const percent = Math.min(time / duration, 1)
    columnWrapper.value?.scrollTo(0, startPos + diff * percent)

    if (time < duration) {
      // Continue moving
      requestId = window.requestAnimationFrame(loop)
    } else if (requestId) {
      window.cancelAnimationFrame(requestId)
      window.setTimeout(() => {
        if (isCancelled.value) return
        scrollColumnToTop()
        window.setTimeout(() => scrollContinuously(isCancelled), 2000)
      }, 2000)
    }
  }
  requestId = window.requestAnimationFrame(loop)
}
</script>

<template>
  <div class="flex-1 overflow-y-scroll" ref="columnWrapper">
    <div ref="columnContent" class="px-2"><slot> </slot></div>
  </div>
</template>
