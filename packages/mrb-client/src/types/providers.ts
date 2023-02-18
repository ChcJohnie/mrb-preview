import type { Ref, InjectionKey } from 'vue'

export type AddScrollTableElementFn = (
  component: Ref<HTMLElement | null>
) => void
export const addScrollTableElementKey =
  Symbol() as InjectionKey<AddScrollTableElementFn>
