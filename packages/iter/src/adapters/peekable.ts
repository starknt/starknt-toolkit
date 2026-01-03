import type { Option } from '@starknt/utils'
import type { Iterator } from '../traits/iter'

/**
 * Iterator adapter that allows peeking at the next element without consuming it.
 */
export class Peekable<const Item, I extends Iterator<Item> = Iterator<Item>> {
  protected iter: I
  protected peeked: Option<Item> | null

  constructor(iter: I) {
    this.iter = iter
    this.peeked = null
  }

  /**
   * Returns a reference to the next element without consuming it.
   * @returns Some(next element) if available, None otherwise
   */
  peek(): Option<Item> {
    if (this.peeked === null) {
      this.peeked = this.iter.next()
    }
    return this.peeked
  }

  next(): Option<Item> {
    if (this.peeked !== null) {
      const item = this.peeked
      this.peeked = null
      return item
    }
    return this.iter.next()
  }
}
