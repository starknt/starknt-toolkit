import type { Option } from '@starknt/utils'
import type { Iterator } from '../traits/iter'
import { None, Some } from '@starknt/utils'

/**
 * Iterator adapter that inserts a separator between elements.
 */
export class Intersperse<const Item, I extends Iterator<Item> = Iterator<Item>> {
  protected iter: I
  protected separator: Item
  protected peeked: Option<Item> | null
  protected need_separator: boolean

  constructor(iter: I, separator: Item) {
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
}
