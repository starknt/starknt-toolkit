import type { Option } from '@starknt/utils'
import type { Iterator } from '../traits/iter'
import { None, Some } from '@starknt/utils'

/**
 * Iterator adapter that inserts separators between elements using a function.
 */
export class IntersperseWith<const Item, I extends Iterator<Item> = Iterator<Item>, F extends () => Item = () => Item> {
  protected iter: I
  protected f: F
  protected peeked: Option<Item> | null
  protected need_separator: boolean

  constructor(iter: I, f: F) {
    this.iter = iter
    this.f = f
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
      return Some(this.f())
    }

    const item = this.peeked !== null ? this.peeked : this.iter.next()
    this.peeked = null

    if (item.isNone())
      return None

    // Peek ahead to see if there's another item
    this.peeked = this.iter.next()
    if (this.peeked.isSome())
      this.need_separator = true

    return item
  }
}
