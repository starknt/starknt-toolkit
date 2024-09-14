import type { Option } from '@starknt/utils'
import { None, Some } from '@starknt/utils'
import type { Iterator } from '../traits/iter'

export class Cycle<Item, I extends Iterator<Item> = Iterator<Item>> {
  protected orig: I
  protected iter: I

  constructor(iter: I) {
    this.orig = iter.clone() as I
    this.iter = iter
  }

  next(): Option<Item> {
    return this.iter.next().match({
      None: () => {
        this.iter = this.orig.clone() as I
        return this.next()
      },
      Some: x => Some(x),
    })
  }

  try_fold<Acc, R extends Option<Acc> = Option<Acc>, F extends (acc: Acc, item: Item) => R = (acc: Acc, item: Item) => R>(acc: Acc, f: F): R {
    // fully iterate the current iterator. this is necessary because
    // `self.iter` may be empty even when `self.orig` isn't
    let _acc = this.iter.try_fold(acc, f)
    if (_acc.isNone())
      return None as R
    else
      acc = _acc.value
    this.iter = this.orig.clone() as I

    // complete a full cycle, keeping track of whether the cycled
    // iterator is empty or not. we need to return early in case
    // of an empty iterator to prevent an infinite loop
    let is_empty = true
    _acc = this.iter.try_fold(acc, (acc, x) => {
      is_empty = false
      return f(acc, x)
    })
    if (_acc.isNone())
      return None as R

    if (is_empty)
      return Some(acc) as R

    while (true) {
      this.iter = this.orig.clone() as I
      _acc = this.iter.try_fold(acc, f)
      if (_acc.isNone())
        return None as R
      else
        acc = _acc.value
    }
  }
}
