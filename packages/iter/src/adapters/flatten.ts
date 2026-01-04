import type { Option } from '@starknt/utils'
import { None } from '@starknt/utils'
import { Iterator } from '../traits/base'

export type FlattenItem<I extends Iterator<any>> = I extends Iterator<infer Item> ? Item extends Iterator<any> ? FlattenItem<Item> : Item : never

/**
 * Iterator adapter that flattens nested iterators.
 */
export class Flatten<const I extends Iterator<any>, Item = FlattenItem<I>> extends Iterator<Item> {
  protected outer: I
  protected inner: Iterator<Item> | null

  constructor(outer: I) {
    super()
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
      this.inner = inner_iter as Iterator<Item>
    }
  }

  clone(): Flatten<I, Item> {
    return new Flatten(this.outer.clone())
  }

  size_hint(): [number, Option<number>] {
    // Flatten cannot accurately predict the size without iterating
    return [0, None]
  }
}
