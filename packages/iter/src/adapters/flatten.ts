import type { Option } from '@starknt/utils'
import type { Iterator } from '../traits/iter'
import { None } from '@starknt/utils'

/**
 * Iterator adapter that flattens nested iterators.
 */
export class Flatten<const Item, I extends Iterator<Iterator<Item>> = Iterator<Iterator<Item>>> {
  protected outer: I
  protected inner: Iterator<Item> | null

  constructor(outer: I) {
    this.outer = outer
    this.inner = null
  }

  next(): Option<Item> {
    while (true) {
      if (this.inner !== null) {
        const item = this.inner.next()
        if (item.isSome())
          return item

        this.inner = null
      }

      const outer_item = this.outer.next()
      if (outer_item.isNone())
        return None

      // Iterator implements IntoIterator, so we can call into_iter()
      const inner_iter = outer_item.value
      this.inner = inner_iter.into_iter()
    }
  }
}
