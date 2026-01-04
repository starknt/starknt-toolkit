import type { Iterator } from '../../src/traits/base'
import { expect } from 'vitest'

/**
 * Generic clone test helper for adapters.
 * Tests that cloning an iterator produces identical results and that
 * cloned iterators can be used independently.
 *
 * @param createIterator Function that creates a new iterator instance
 * @param expectedItems Expected items when collecting the iterator
 */
export function testClone<Item>(
  createIterator: () => Iterator<Item>,
  expectedItems: Item[],
): void {
  // Test that cloned iterators produce the same results
  const cloned1 = createIterator().clone()
  expect(cloned1.collect()).toStrictEqual(expectedItems)

  const cloned2 = createIterator().clone()
  expect(cloned2.collect()).toStrictEqual(expectedItems)

  // Test that cloned iterators can be used independently
  const cloned3 = createIterator().clone()
  const cloned4 = createIterator().clone()

  // Clone should create independent iterators
  expect(cloned3.collect()).toStrictEqual(expectedItems)
  expect(cloned4.collect()).toStrictEqual(expectedItems)
}
