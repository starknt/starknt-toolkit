import type { Option } from '@starknt/utils'
import { None } from '@starknt/utils'
import { Iterator } from '../traits/base'

export class Skip<const Item, I extends Iterator<Item> = Iterator<Item>> extends Iterator<Item> {
  protected iter: I
  protected n: number
  private original_iter: I
  private original_n: number

  constructor(iter: I, n: number) {
    super()
    this.iter = iter
    this.n = n
    this.original_iter = iter
    this.original_n = n
  }

  next(): Option<Item> {
    if (this.n > 0) {
      const n = this.n
      this.n = 0
      return this.iter.nth(n)
    }
    return this.iter.next()
  }

  is_empty(): boolean {
    if (this.n > 0) {
      if (this.iter.nth(this.n - 1).isNone())
        return true
    }
    return this.iter.is_empty()
  }

  len(): number {
    if (this.n > 0) {
      if (this.iter.nth(this.n - 1).isNone())
        return 0
    }
    return this.iter.len()
  }

  nth(n: number): Option<Item> {
    if (this.n > 0) {
      let skip = this.n
      this.n = 0
      if (skip + n > Number.MAX_SAFE_INTEGER) {
        const s = this.iter.nth(skip + n - 1)
        if (s.isNone())
          return None
      }
      skip = skip + n

      // Load nth element including skip.
      return this.iter.nth(skip)
    }

    return this.iter.nth(n)
  }

  count(): number {
    if (this.n > 0) {
      if (this.iter.nth(this.n - 1).isNone())
        return 0
    }
    return this.iter.count()
  }

  last(): Option<Item> {
    if (this.n > 0) {
      if (this.iter.nth(this.n - 1).isNone())
        return None
    }
    return this.iter.last()
  }

  size_hint(): [number, Option<number>] {
    // not implemented
    return [0, None]
  }

  clone(): Skip<Item, I> {
    return new Skip(this.original_iter.clone(), this.original_n)
  }
}
