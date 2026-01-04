import type { Option } from '@starknt/utils'
import { None, Some } from '@starknt/utils'
import { Iterator } from '../traits/base'

function and_then_or_clear<T, U>(opt: Option<T>, f: (t: T) => Option<U>): Option<U> {
  if (opt.isNone())
    return opt
  const x = f(opt.value)
  if (x.isNone())
    opt = None

  return x
}

export class Fuse<I extends Iterator<Item>, Item = I extends Iterator<infer Item> ? Item : never> extends Iterator<Item> {
  // NOTE: for `I: FusedIterator`, we never bother setting `None`, but
  // we still have to be prepared for that state due to variance.
  protected iter: Option<I>
  private original_iter: I

  constructor(iter: I) {
    super()
    this.iter = Some(iter)
    this.original_iter = iter
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

  // try_fold<Acc, R extends Option<Acc> = Option<Acc>, Fold extends (acc: Acc, item: Item) => R = (acc: Acc, item: Item) => R>(acc: Acc, fold: Fold): R {
  //   return this.iter.match<Option<Acc>>({
  //     Some: (iter) => {
  //       const _acc = iter.try_fold(acc, fold)
  //       if (_acc.isNone())
  //         return None
  //       this.iter = None

  //       return _acc
  //     },
  //     None: () => {
  //       return Some(acc)
  //     },
  //   }) as R
  // }

  // fold<Acc, Fold extends (acc: Acc, item: Item) => Acc = (acc: Acc, item: Item) => Acc>(acc: Acc, fold: Fold): Acc {
  //   return this.iter.match({
  //     Some: iter => iter.fold(acc, fold),
  //     None: () => acc,
  //   })
  // }

  count(): number {
    return this.iter.match({
      Some: iter => iter.count(),
      None: () => 0,
    })
  }

  last(): Option<Item> {
    return this.iter.match({
      Some: iter => iter.last(),
      None: () => None,
    })
  }

  find<P extends (item: Item) => boolean>(predicate: P): Option<Item> {
    return and_then_or_clear(this.iter, iter => iter.find(predicate))
  }

  clone(): Fuse<I, Item> {
    return new Fuse(this.original_iter.clone() as I)
  }
}
