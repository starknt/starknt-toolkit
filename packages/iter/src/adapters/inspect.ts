import type { Option } from '@starknt/utils'
import { Iterator } from '../traits/base'

/**
 * Iterator adapter that allows inspecting each element with a side-effect function.
 * The element itself is not modified, only observed.
 */
export class Inspect<I extends Iterator<Item>, F extends (item: Item) => void, Item = I extends Iterator<infer Item> ? Item : never> extends Iterator<Item> {
  protected iter: I
  protected f: F

  constructor(iter: I, f: F) {
    super()
    this.iter = iter
    this.f = f
  }

  /**
   * Returns the next element after applying the inspection function.
   * @returns Some(next element) if available, None otherwise
   */
  next(): Option<Item> {
    const item = this.iter.next()
    if (item.isSome())
      this.f(item.value)
    return item
  }

  clone(): Inspect<I, F, Item> {
    return new Inspect(this.iter.clone(), this.f)
  }

  size_hint(): [number, Option<number>] {
    return this.iter.size_hint()
  }
}
