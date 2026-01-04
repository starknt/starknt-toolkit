import type { Option } from '@starknt/utils'
import { Iterator } from '../traits/base'

/**
 * Iterator adapter that allows peeking at the next element without consuming it.
 */
export class Peekable<I extends Iterator<Item>, Item = I extends Iterator<infer Item> ? Item : never> extends Iterator<Item> {
  protected iter: I
  protected peeked: Option<Item> | null

  constructor(iter: I) {
    super()
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

  clone(): Peekable<I, Item> {
    return new Peekable(this.iter.clone() as I)
  }

  size_hint(): [number, Option<number>] {
    return this.iter.size_hint()
  }
}
