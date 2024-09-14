import { type Option, Some } from '@starknt/utils'
import type { Iterator } from '../traits/iter'

function filter_map_try_fold<T, B, Acc, R extends Option<Acc> = Option<Acc>>(
  f: (t: T) => Option<B>,
  fold: (acc: Acc, b: B) => R,
): (acc: Acc, t: T) => R {
  return (acc: Acc, item: T) => f(item).match<R>({
    Some: x => fold(acc, x),
    None: () => Some(acc) as R,
  })
}

function filter_map_fold<T, B, Acc>(
  f: (t: T) => Option<B>,
  fold: (acc: Acc, b: B) => Acc,
): (acc: Acc, t: T) => Acc {
  return (acc: Acc, item: T) => f(item).match({
    Some: x => fold(acc, x),
    None: () => acc,
  })
}

export class FilterMap<Item, Output = Item, I extends Iterator<Item> = Iterator<Item>, F extends (item: Item) => Option<Output> = (item: Item) => Option<Output>,
> {
  protected iter: I
  protected f: F

  constructor(iter: I, f: F) {
    this.iter = iter
    this.f = f
  }

  next(): Option<Output> {
    return this.iter.find_map<Output>(this.f)
  }

  try_fold<Acc, R extends Option<Acc> = Option<Acc>, Fold extends (acc: Acc, item: Output) => R = (acc: Acc, item: Output) => R>(init: Acc, fold: Fold): R {
    return this.iter.try_fold(init, filter_map_try_fold(this.f, fold))
  }

  fold<Acc, Fold extends (acc: Acc, item: Output) => Acc = (acc: Acc, item: Output) => Acc>(init: Acc, fold: Fold): Acc {
    return this.iter.fold(init, filter_map_fold<Item, Output, Acc>(this.f, fold))
  }
}
