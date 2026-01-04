import type { Option } from '@starknt/utils'
import { None, Some } from '@starknt/utils'
import { Iterator } from '../traits/base'

/**
 * Iterator adapter that inserts a separator between elements.
 */
export class Intersperse<I extends Iterator<Item>, Item = I extends Iterator<infer Item> ? Item : never> extends Iterator<Item> {
  protected iter: I
  protected separator: Item
  protected peeked: Option<Item> | null
  protected need_separator: boolean

  constructor(iter: I, separator: Item) {
    super()
    this.iter = iter
    this.separator = separator
    this.peeked = null
    this.need_separator = false
  }

  /**
   * Returns the next element.
   * @returns Some(next element) if available, None otherwise
   */
  next(): Option<Item> {
    if (this.need_separator) {
      this.need_separator = false
      return Some(this.separator)
    }

    if (this.peeked === null)
      this.peeked = this.iter.next()

    const item = this.peeked
    this.peeked = null

    if (item.isNone())
      return None

    // Check if there's a next item to determine if we need a separator
    this.peeked = this.iter.next()
    if (this.peeked.isSome())
      this.need_separator = true

    return item
  }

  clone(): Intersperse<I, Item> {
    return new Intersperse(this.iter.clone(), this.separator)
  }

  size_hint(): [number, Option<number>] {
    const [lower, upper] = this.iter.size_hint()
    // Intersperse adds n-1 separators for n elements
    // If lower is 0, result is 0. Otherwise, lower * 2 - 1
    const interspersed_lower = lower === 0 ? 0 : Math.max(0, lower * 2 - 1)
    const interspersed_upper = upper.match({
      Some: (u) => {
        if (u === 0)
          return Some(0)
        // For u elements, we have u + (u-1) = 2u - 1 total items
        return Some(2 * u - 1)
      },
      None: () => None,
    })
    return [interspersed_lower, interspersed_upper]
  }
}
