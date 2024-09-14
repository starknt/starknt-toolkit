import { None, type Option, Some } from '@starknt/utils'
import type { Iterator } from '../traits/iter'

export class Skip<Item, I extends Iterator<Item> = Iterator<Item>> implements Iterator<Item> {
  protected iter: I
  protected n: number

  constructor(iter: I, n: number) {
    this.iter = iter
    this.n = n
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

  // @ts-expect-error allow
  try_fold<Acc, R extends Option<Acc> = Option<Acc>, Fold extends (b: Acc, item: Item) => R = (init: Acc, item: Item) => R>(init: Acc, fold: Fold): R {
    const n = this.n
    this.n = 0
    if (n > 0) {
      // nth(n) skips n+1
      if (this.iter.nth(n - 1).isNone())
        return Some(init) as R
    }

    return this.iter.try_fold(init, fold)
  }

  // @ts-expect-error allow
  fold<Acc, Fold extends (b: Acc, item: Item) => Acc = (b: Acc, item: Item) => Acc>(init: Acc, fold: Fold): Acc {
    if (this.n > 0) {
      // nth(n) skips n+1
      if (this.iter.nth(this.n - 1).isNone())
        return init
    }

    return this.iter.fold(init, fold)
  }
}
