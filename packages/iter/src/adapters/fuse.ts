import type { Option } from '@starknt/utils'
import { None, Some } from '@starknt/utils'
import type { Iterator } from '../traits/iter'

function and_then_or_clear<T, U>(opt: Option<T>, f: (t: T) => Option<U>): Option<U> {
  if (opt.isNone())
    return None

  const x = f(opt.value)
  if (x.isNone())
    opt = None

  return x
}

export class Fuse<Item, I extends Iterator<Item> = Iterator<Item>> {
  // NOTE: for `I: FusedIterator`, we never bother setting `None`, but
  // we still have to be prepared for that state due to variance.
  protected iter: Option<I>

  constructor(iter: I) {
    this.iter = Some(iter)
  }

  into_inner(): Option<Iterator<Item>> {
    return this.iter
  }

  next(): Option<Item> {
    return and_then_or_clear(this.iter, i => i.next())
  }

  nth(n: number): Option<Item> {
    return and_then_or_clear(this.iter, i => i.nth(n))
  }

  last(): Option<Item> {
    return this.iter.match({
      Some: iter => iter.last(),
      None: () => None,
    })
  }

  count(): number {
    return this.iter.match({
      Some: iter => iter.count(),
      None: () => 0,
    })
  }

  try_fold<Acc, R extends Option<Acc> = Option<Acc>, Fold extends (acc: Acc, item: Item) => R = (acc: Acc, item: Item) => R>(acc: Acc, fold: Fold): R {
    return this.iter.match<Option<Acc>>({
      Some: (iter) => {
        const _acc = iter.try_fold(acc, fold)
        if (_acc.isNone())
          return None
        this.iter = None

        return Some(acc)
      },
      None: () => {
        return Some(acc)
      },
    }) as R
  }

  fold<Acc, Fold extends (acc: Acc, item: Item) => Acc = (acc: Acc, item: Item) => Acc>(acc: Acc, fold: Fold): Acc {
    return this.iter.match({
      Some: iter => iter.fold(acc, fold),
      None: () => acc,
    })
  }

  find<P extends (item: Item) => boolean>(predicate: P): Option<Item> {
    return and_then_or_clear(this.iter, iter => iter.find(predicate))
  }
}
