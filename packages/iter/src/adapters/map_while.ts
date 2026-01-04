import type { Option } from '@starknt/utils'
import { None } from '@starknt/utils'
import { Iterator } from '../traits/base'

/**
 * Iterator adapter that maps elements to Option values.
 * Stops when encountering the first None.
 */
export class MapWhile<I extends Iterator<Item>, F extends (item: Item) => Option<unknown>, Item = I extends Iterator<infer Item> ? Item : never, Output = F extends (item: Item) => Option<infer Output> ? Output : never> extends Iterator<Output> {
  protected iter: I
  protected f: F

  constructor(iter: I, f: F) {
    super()
    this.iter = iter
    this.f = f
  }

  /**
   * Returns the next element.
   * @returns Some(next element) if available, None otherwise (stops iteration)
   */
  next(): Option<Output> {
    const item = this.iter.next()
    if (item.isNone())
      return None

    const mapped = (this.f as (item: Item) => Option<Output>)(item.value)
    if (mapped.isNone())
      return None

    return mapped
  }

  clone(): MapWhile<I, F, Item, Output> {
    return new MapWhile(this.iter.clone(), this.f)
  }

  size_hint(): [number, Option<number>] {
    // MapWhile may stop early, so lower bound is 0
    // Upper bound is the same as the underlying iterator
    const [_, upper] = this.iter.size_hint()
    return [0, upper]
  }
}
