<script setup lang="ts">
import { provide } from 'vue'

import { useLiveResultat } from '@/composables/providers/useLiveResultat'
import { useTestMocks } from '@/composables/providers/useMocks'

import { useDataProviderKey, type DataProviderSet } from '@/types/providers'

const props = defineProps<{
  provider: string
}>()

const providerList: { [providerName: string]: DataProviderSet } = {
  liveResultat: useLiveResultat,
  test: useTestMocks,
}
const useProvider = providerList[props.provider]

provide(useDataProviderKey, useProvider)
</script>

<template>
  <slot></slot>
</template>
