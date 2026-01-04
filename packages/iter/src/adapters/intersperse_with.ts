import type { Option } from '@starknt/utils'
import { None, Some } from '@starknt/utils'
import { Iterator } from '../traits/base'

/**
 * Iterator adapter that inserts separators between elements using a function.
 */
export class IntersperseWith<I extends Iterator<Item>, F extends () => Item, Item = I extends Iterator<infer Item> ? Item : never> extends Iterator<Item> {
  protected iter: I
  protected f: F
  protected peeked: Option<Item> | null
  protected need_separator: boolean

  constructor(iter: I, f: F) {
    super()
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

  clone(): IntersperseWith<I, F, Item> {
    return new IntersperseWith(this.iter.clone(), this.f)
  }
}
