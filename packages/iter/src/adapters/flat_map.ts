import type { Option } from '@starknt/utils'
import type { IntoIterator } from '../interfaces/iter'
import type { Iterator } from '../traits/iter'
import { None } from '@starknt/utils'

export class FlatMap<const Item, Output, I extends Iterator<Item> = Iterator<Item>, F extends (item: Item) => IntoIterator<Output> = (item: Item) => IntoIterator<Output>> {
  protected outer: I
  protected f: F
  protected inner: Iterator<Output> | null

  constructor(outer: I, f: F) {
    this.outer = outer
    this.f = f
    this.inner = null
  }

  next(): Option<Output> {
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

      this.inner = this.f(outer_item.value).into_iter()
    }
  }
}
