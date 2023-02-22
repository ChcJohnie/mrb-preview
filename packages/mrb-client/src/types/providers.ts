import type { Ref, InjectionKey } from 'vue'
import type { useLiveResultat } from '@/composables/providers/useLiveResultat'

export type AddScrollTableElementFn = (component: Ref<HTMLElement>) => void
export const addScrollTableElementKey =
  Symbol() as InjectionKey<AddScrollTableElementFn>

export type DataProviderSet = typeof useLiveResultat
export const useDataProviderKey = Symbol() as InjectionKey<DataProviderSet>
