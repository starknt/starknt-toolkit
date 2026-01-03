import type { Option } from '@starknt/utils'
import type { Iterator } from '../traits/iter'
import { None, Some } from '@starknt/utils'

export class Take<const Item, I extends Iterator<Item> = Iterator<Item>> {
  protected iter: I
  protected n: number

  constructor(iter: I, n: number) {
    this.iter = iter
    this.n = n
  }

  next(): Option<Item> {
    if (this.n !== 0) {
      this.n -= 1
      return this.iter.next()
    }

    return None
  }

  nth(n: number): Option<Item> {
    if (this.n > n) {
      this.n -= n + 1
      return this.iter.nth(n)
    }
    else {
      if (this.n > 0) {
        this.iter.nth(this.n - 1)
        this.n = 0
      }
      return None
    }
  }

  fold<Acc, Fold extends (acc: Acc, item: Item) => Acc = (acc: Acc, item: Item) => Acc>(acc: Acc, fold: Fold): Acc {
    return this.iter.fold(acc, fold)
  }

  try_fold<Acc, R extends Option<Acc> = Option<Acc>, Fold extends (acc: Acc, item: Item) => R = (acc: Acc, item: Item) => R>(init: Acc, fold: Fold): R {
    // eslint-disable-next-line ts/no-this-alias
    const self = this
    function check<T, Acc, R = Option<Acc>>(
      fold: (acc: Acc, t: T) => R,
    ): (acc: Acc, t: T) => R {
      return (acc: Acc, x: T) => {
        self.n -= 1
        const r = fold(acc, x) as Option<Acc>
        if (self.n === 0) {
          return Some(r) as R
        }
        else {
          if (r.isNone())
            return None as R
          else
            return r as R
        }
      }
    }

    if (this.n === 0)
      return Some(init) as R
    else
      return Some(this.iter.try_fold(init, check(fold))) as R
  }
}
