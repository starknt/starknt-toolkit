import type { Option } from '@starknt/utils'
import { None, Some } from '@starknt/utils'
import { Iterator } from '../traits/base'

/**
 * Iterator adapter that repeats an iterator endlessly.
 * Elements are cached on the first iteration, then reused for subsequent cycles.
 * This implementation does not require clone() - it caches elements instead.
 */
export class Cycle<I extends Iterator<Item>, Item = I extends Iterator<infer Item> ? Item : never> extends Iterator<Item> {
  protected iter: I
  protected cache: Item[] | null = null
  protected cacheIndex: number = 0

  constructor(iter: I) {
    super()
    this.iter = iter
  }

  next(): Option<Item> {
    // If cache is not yet created, try to get next element from iterator
    if (this.cache === null) {
      const item = this.iter.next()
      if (item.isSome()) {
        // First element found, initialize cache and start collecting
        this.cache = [item.value]
        this.cacheIndex = 1
        return item
      }
      // Iterator was empty from the start
      return None
    }

    // Cache exists, use it for cycling
    if (this.cacheIndex < this.cache.length) {
      return Some(this.cache[this.cacheIndex++])
    }

    // Cache exhausted, try to get more elements from iterator
    const item = this.iter.next()
    if (item.isSome()) {
      this.cache.push(item.value)
      this.cacheIndex++
      return item
    }

    // Iterator exhausted, reset to start of cache for next cycle
    if (this.cache.length === 0) {
      return None
    }

    this.cacheIndex = 1
    return Some(this.cache[0])
  }
}
