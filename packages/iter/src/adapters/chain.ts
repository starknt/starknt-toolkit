import type { Option } from '@starknt/utils'
import type { Iterator } from '../traits/iter'
import { None, Some } from '@starknt/utils'

function and_then_or_clear<T, U>(opt: Option<T>, f: (item: T) => Option<U>): Option<U> {
  if (opt.isNone())
    return opt
  const x = f(opt.value)
  if (x.isNone())
    opt = None

  return x
}

export class Chain<A extends Iterator<Item>, B extends Iterator<Item>, const Item> {
  protected a: Option<A>
  protected b: Option<B>

  constructor(a: A, b: B) {
    this.a = Some(a)
    this.b = Some(b)
  }

  next(): Option<Item> {
    if (this.a.isNone())
      return None

    return and_then_or_clear(
      this.a,
      this.a.value.next,
    ).orElse(() => this.b.isSome() ? this.b.value.next() : None)
  }

  count(): number {
    const a_count = this.a.match({
      Some: a => a.count(),
      None: () => 0,
    })
    const b_count = this.b.match({
      Some: b => b.count(),
      None: () => 0,
    })

    return a_count + b_count
  }

  try_fold<Acc, R extends Option<Acc> = Option<Acc>, F extends (acc: Acc, item: Item) => R = (acc: Acc, item: Item) => R>(acc: Acc, f: F): R {
    if (this.a.isSome()) {
      const _acc = this.a.value.try_fold(acc, f)
      if (_acc.isNone())
        return None as R
      else
        acc = _acc.value
      this.a = None
    }
    if (this.b.isSome()) {
      const _acc = this.b.value.try_fold(acc, f)
      if (_acc.isNone())
        return None as R
      else
        acc = _acc.value
      // we don't fuse the second iterator
    }

    return Some(acc) as R
  }

  fold<Acc, F extends (acc: Acc, item: Item) => Acc = (acc: Acc, item: Item) => Acc>(acc: Acc, f: F): Acc {
    if (this.a.isSome())
      acc = this.a.value.fold(acc, f)
    if (this.b.isSome())
      acc = this.b.value.fold(acc, f)
    return acc
  }

  // advance_by(n: number): Result<Tuple, number> {
  //   if (this.a.isSome()) {
  //     n = this.a.value.advance_by(n).match({
  //       Ok: () => Ok(Tuple),
  //       Err: (n) => Err(n),
  //     })
  //   }
  // }

  find<P extends (item: Item) => boolean>(predicate: P) {
    return and_then_or_clear(this.a, a => a.find(predicate))
      .orElse(() => this.b.isSome() ? this.b.value.find(predicate) : None)
  }

  last(): Option<Item> {
    const a_last = this.a.andThen(a => a.last())
    const b_last = this.b.andThen(b => b.last())
    return b_last.or(a_last)
  }
}
