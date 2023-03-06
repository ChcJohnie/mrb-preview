import * as matchers from 'vitest-dom/matchers'
import type { TestingLibraryMatchers } from 'vitest-dom/matchers'
import { expect, afterAll, afterEach, beforeAll } from 'vitest'
import { mockServer } from './test/mock-server'
import 'vitest-dom/extend-expect'

expect.extend(matchers)

beforeAll(() => mockServer.listen({ onUnhandledRequest: 'error' }))
afterAll(() => mockServer.close())
afterEach(() => mockServer.resetHandlers())

declare global {
  namespace Vi {
    interface Assertion<T = any>
      extends TestingLibraryMatchers<typeof expect.stringContaining, T> {}
  }
}
