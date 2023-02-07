<script lang="ts" setup>
import { provide, ref } from 'vue'
import type { Ref } from 'vue'

const columnRef = ref<HTMLElement>()
const tableRegistry: Ref<HTMLElement>[] = []
const registerTableElement = (component: Ref<HTMLElement>) =>
  tableRegistry.push(component)
provide('addTable', registerTableElement)

function logSlots() {
  console.log(tableRegistry)
}

window.setTimeout(logSlots, 1000)

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

function isFullyDisplayed(table: Ref<HTMLElement>) {
  const rect = table.value.getBoundingClientRect()
  const bottomMargin = rootFontSizePx
  const tablePxRemaining = rect.bottom - window.innerHeight
  return Math.floor(tablePxRemaining) <= bottomMargin
}

const STICKY_HEADER_REMS = 4.5
const rootFontSize = window.getComputedStyle(document.documentElement).fontSize
const rootFontSizePx = parseInt(rootFontSize.slice(0, -2))

function scrollByHeight() {
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

function scrollContinuously() {
  const duration = 20 * 1000
  const rect = columnRef.value?.getBoundingClientRect()
  const scrollLength = rect ? rect.bottom - window.innerHeight : 0

  const startPos = window.pageYOffset
  const diff = scrollLength ?? 0

  let startTime: number | null = null
  let requestId: number | null

  const loop = function (currentTime: DOMHighResTimeStamp) {
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
    }
  }
  requestId = window.requestAnimationFrame(loop)
}
</script>

<template>
  <div ref="columnRef">
    <button
      class="fixed bottom-6 z-3 bg-white border-black border-2"
      @click="scrollByHeight"
    >
      Scroll by height
    </button>
    <button
      class="fixed bottom-6 left-60 z-3 bg-white border-black border-2"
      @click="scrollContinuously"
    >
      Continues scroll
    </button>
    <slot> </slot>
  </div>
</template>
