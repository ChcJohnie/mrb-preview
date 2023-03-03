<script setup lang="ts">
import { provide } from 'vue'

import { useLiveResultat } from '@/composables/providers/useLiveResultat'
import { useMockData } from '@/composables/providers/useMockData'

import { useDataProviderKey, type DataProviderSet } from '@/types/providers'

const props = defineProps<{
  provider: string
}>()

const providerList: { [providerName: string]: DataProviderSet } = {
  liveResultat: useLiveResultat,
  test: useMockData,
}
const useProvider = providerList[props.provider]

provide(useDataProviderKey, useProvider)
</script>

<template>
  <slot></slot>
</template>
