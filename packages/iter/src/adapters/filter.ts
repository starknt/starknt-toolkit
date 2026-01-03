import type { Option } from '@starknt/utils'
import type { IntoIterator } from '../interfaces/iter'
import type { Iterator } from '../traits/iter'
import { None, Some } from '@starknt/utils'

function filter_try_fold<T, Acc, R extends Option<Acc> = Option<Acc>>(
  predicate: (item: T) => boolean,
  fold: (acc: Acc, t: T) => R,
): (acc: Acc, t: T) => R {
  return (acc: Acc, item: T) => {
    if (predicate(item))
      return fold(acc, item)

    return Some(acc) as R
  }
}

function filter_fold<T, Acc>(
  predicate: (item: T) => boolean,
  fold: (acc: Acc, t: T) => Acc,
): (acc: Acc, t: T) => Acc {
  return (acc: Acc, item: T) => {
    if (predicate(item))
      return fold(acc, item)

    return acc
  }
}

export class Filter<const Item, I extends Iterator<Item> = Iterator<Item>, P extends (item: Item) => boolean = (item: Item) => boolean> implements IntoIterator<Item> {
  protected iter: I
  protected predicate: P

  constructor(iter: I, predicate: P) {
    this.iter = iter
    this.predicate = predicate
  }

  next(): Option<Item> {
    let item: Option<Item>
    while ((item = this.iter.next()) && item.isSome()) {
      if (this.predicate(item.value))
        return item
    }
    return None
  }

  count(): number {
    function to_size<T extends Item>(predicate: P): (item: T) => number {
      return (item: T) => predicate(item) ? 1 : 0
    }

    // @ts-expect-error transform to number
    return this.iter.map<number>(to_size(this.predicate)).fold(0 as number, (a, b) => a + b)
  }

  try_fold<Acc, R extends Option<Acc> = Option<Acc>, Fold extends (acc: Acc, item: Item) => R = (acc: Acc, item: Item) => R>(init: Acc, fold: Fold): R {
    return this.iter.try_fold(init, filter_try_fold(this.predicate, fold))
  }

  fold<Acc, Fold extends (acc: Acc, item: Item) => Acc = (acc: Acc, item: Item) => Acc>(init: Acc, fold: Fold): Acc {
    return this.iter.fold<Acc>(init, filter_fold(this.predicate, fold))
  }

  into_iter(): Iterator<Item> {
    return this.iter
  }
}
