<script lang="ts" setup>
import { provide, ref, watch, unref } from 'vue'
import type { Ref } from 'vue'

let activeScroll: null | Function = null
const scrollType = ref('none')
const columnRef = ref<HTMLElement>()
const tableRegistry: Ref<HTMLElement>[] = []
const registerTableElement = (component: Ref<HTMLElement>) =>
  tableRegistry.push(component)
provide('addTable', registerTableElement)

function logSlots() {
  console.log(tableRegistry)
}

window.setTimeout(logSlots, 1000)

function isColumnBottom() {
  if (!columnRef.value) return true
  return isFullyDisplayed(columnRef.value)
}

function scrollColumnToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// find last visible table
function findLastVisibleTable() {
  return tableRegistry
    .slice()
    .reverse()
    .find((table) => {
      const rect = table.value.getBoundingClientRect()
      // console.log(rect)
      return rect.top < window.innerHeight && rect.bottom > 0
    })
}

function isFullyDisplayed(table: Ref<HTMLElement> | HTMLElement) {
  const tableElement = unref(table)
  const rect = tableElement.getBoundingClientRect()
  const bottomMargin = rootFontSizePx
  const tablePxRemaining = rect.bottom - window.innerHeight
  return Math.floor(tablePxRemaining) <= bottomMargin
}

const STICKY_HEADER_REMS = 4.5
const rootFontSize = window.getComputedStyle(document.documentElement).fontSize
const rootFontSizePx = parseInt(rootFontSize.slice(0, -2))

function scrollDownByHeight() {
  const wHeight = window.innerHeight
  const lastTable = findLastVisibleTable()
  const heightSubtract =
    lastTable && isFullyDisplayed(lastTable)
      ? 0
      : STICKY_HEADER_REMS * rootFontSizePx
  const height = wHeight - heightSubtract
  if (height) window.scrollBy({ top: height, behavior: 'smooth' })
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

function setScrollType(type: string) {
  scrollType.value = type
}

watch(scrollType, (type) => {
  if (activeScroll) {
    activeScroll()
    activeScroll = null
  }
  if (type === 'none') return
  if (type === 'page') {
    activeScroll = setupPageScroll()
  }
  if (type === 'continues') activeScroll = setupContinuesScroll()
})
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
  const rect = columnRef.value?.getBoundingClientRect()
  const scrollLength = rect ? rect.bottom - window.innerHeight : 0

  const startPos = window.pageYOffset
  const diff = scrollLength ?? 0

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
    window.scrollTo(0, startPos + diff * percent)

    if (time < duration) {
      // Continue moving
      requestId = window.requestAnimationFrame(loop)
    } else if (requestId) {
      window.cancelAnimationFrame(requestId)
      scrollColumnToTop()
      scrollContinuously(isCancelled)
    }
  }
  requestId = window.requestAnimationFrame(loop)
}
</script>

<template>
  <div ref="columnRef">
    <div class="fixed bottom-12 z-3 bg-white border-black border-2">
      <span>SCROLL: {{ scrollType }}</span>
    </div>
    <div class="fixed bottom-6 z-3 flex gap-3">
      <button
        class="bg-white border-black border-2"
        @click="setScrollType('page')"
      >
        Scroll by height
      </button>
      <button
        class="bg-white border-black border-2"
        @click="setScrollType('continues')"
      >
        Continues scroll
      </button>

      <button
        class="bg-white border-black border-2"
        @click="setScrollType('none')"
      >
        No scroll
      </button>
    </div>

    <slot> </slot>
  </div>
</template>
