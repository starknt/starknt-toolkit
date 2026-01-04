import type { Option } from '@starknt/utils'
import type { Iterator } from '../traits/iter'

/**
 * Iterator adapter that allows inspecting each element with a side-effect function.
 * The element itself is not modified, only observed.
 */
export class Inspect<const Item, I extends Iterator<Item> = Iterator<Item>, F extends (item: Item) => void = (item: Item) => void> {
  protected iter: I
  protected f: F

  constructor(iter: I, f: F) {
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
}
