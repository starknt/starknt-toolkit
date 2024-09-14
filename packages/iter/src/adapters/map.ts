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

export class Map<Item, F extends (item: Item) => any = (item: Item) => any, I extends Iterator<Item> = Iterator<Item>, Output extends ReturnType<F> = ReturnType<F>,
> implements IntoIterator<Item> {
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

  fold<Acc extends Item, G extends (acc: Acc, item: Item) => Acc = (acc: Acc, item: Item) => Acc>(init: Acc, g: G): Acc {
    return this.iter.fold(init, map_fold(this.f, g))
  }

  into_iter(): Iterator<Item> {
    return this.iter
  }
}
