import type { Option, Result } from '@starknt/utils'
import type { Iterator } from '../traits/iter'
import { None, Some } from '@starknt/utils'

export class Enumerate<const Item, I extends Iterator<Item> = Iterator<Item>, Output extends [number, Item] = [number, Item]> {
  protected iter: I
  private _count: number

  constructor(iter: I) {
    this.iter = iter
    this._count = 0
  }

  next(): Option<Output> {
    const a = this.iter.next()
    if (a.isNone())
      return None
    const i = this._count
    this._count += 1
    return Some([i, a.value]) as Option<Output>
  }

  nth(n: number): Option<Output> {
    const a = this.iter.nth(n)
    if (a.isNone())
      return None
    const i = this._count + n
    this._count = i + 1
    return Some([i, a.value]) as Option<Output>
  }

  count(): number {
    return this.iter.count()
  }

  try_fold<Acc, R extends Option<Acc> = Option<Acc>, Fold extends (acc: Acc, item: Output) => R = (acc: Acc, item: Output) => R>(init: Acc, fold: Fold): R {
    // eslint-disable-next-line ts/no-this-alias
    const self = this
    function enumerate<T, Acc>(
      fold: (acc: Acc, item: [number, T]) => R,
    ): (acc: Acc, t: T) => R {
      return (acc: Acc, item: T) => {
        const accum = fold(acc, [self._count, item])
        self._count += 1
        return accum
      }
    }

    // @ts-expect-error allow
    return this.iter.try_fold(init, enumerate(fold))
  }

  fold<Acc, Fold extends (acc: Acc, item: Output) => Acc = (acc: Acc, item: Output) => Acc>(init: Acc, fold: Fold): Acc {
    // eslint-disable-next-line ts/no-this-alias
    const self = this
    function enumerate<T, Acc>(
      fold: (acc: Acc, item: [number, T]) => Acc,
    ): (acc: Acc, t: T) => Acc {
      return (acc: Acc, item: T) => {
        const accum = fold(acc, [self._count, item])
        self._count += 1
        return accum
      }
    }

    // @ts-expect-error allow
    return this.iter.fold(init, enumerate(fold))
  }

  advance_by(n: number): Result<undefined, number> {
    const remaining = this.iter.advance_by(n)
    const advance = remaining.match<number>({
      Ok: () => n,
      Err: rem => n - rem,
    })
    this._count += advance
    return remaining
  }
}
