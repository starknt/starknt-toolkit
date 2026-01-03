import type { Option } from '@starknt/utils'
import type { IntoIterator } from '../interfaces/iter'
import type { Iterator } from '../traits/iter'

function map_try_fold<T, B, Acc>(
  f: (item: T) => B,
  g: (acc: Acc, b: B) => Acc,
): (acc: Acc, item: T) => Acc {
  return (acc, elt) => g(acc, f(elt))
}

function map_fold<T, B, Acc>(
  f: (item: T) => B,
  g: (acc: Acc, b: B) => Acc,
): (acc: Acc, item: T) => Acc {
  return (acc, elt) => g(acc, f(elt))
}

export class Map<const Item, Output = Item, I extends Iterator<Item> = Iterator<Item>, F extends (item: Item) => Output = (item: Item) => Output,
> implements IntoIterator<Output> {
  protected iter: I
  protected f: F

  constructor(iter: I, f: F) {
    this.iter = iter
    this.f = f
  }

  next(): Option<Output> {
    return this.iter.next().map(this.f)
  }

  try_fold<Acc, R extends Option<Acc> = Option<Acc>, G extends (acc: Acc, item: Item) => R = (acc: Acc, item: Item) => R>(init: Acc, g: G): R {
    // @ts-expect-error allow
    return this.iter.try_fold(init, map_try_fold(this.f, g))
  }

  fold<Acc, G extends (acc: Acc, item: Output) => Acc = (acc: Acc, item: Output) => Acc>(init: Acc, g: G): Acc {
    return this.iter.fold(init, map_fold(this.f, g))
  }

  into_iter(): Iterator<Output> {
    // Map adapter returns Output type, but we can't return Iterator<Output> directly
    // This is a limitation of the current design
    return this.iter as any as Iterator<Output>
  }
}
