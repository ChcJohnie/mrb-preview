import * as matchers from 'vitest-dom/matchers'
import { TestingLibraryMatchers } from 'vitest-dom/matchers'
import { expect } from 'vitest'
import 'vitest-dom/extend-expect'

expect.extend(matchers)

declare global {
  namespace Vi {
    interface Assertion<T = any>
      extends TestingLibraryMatchers<typeof expect.stringContaining, T> {}
  }
}
