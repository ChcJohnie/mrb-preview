import type { Ref, InjectionKey } from 'vue'

export type AddScrollTableElementFn = (component: Ref<HTMLElement>) => void
export const addScrollTableElementKey =
  Symbol() as InjectionKey<AddScrollTableElementFn>
