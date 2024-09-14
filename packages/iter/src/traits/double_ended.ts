import type { Option, Result } from '@starknt/utils'
import { Err, None, Ok, Some } from '@starknt/utils'
import { Rev } from '../adapters/rev'
import { Iterator } from './iter'

export abstract class DoubleEndedIterator<Item> extends Iterator<Item> {
  abstract next_back(): Option<Item>

  len(): number {
    return this.len()
  }

  advance_back_by(n: number): Result<undefined, number> {
    for (let i = 0; i < n; i++) {
      if (this.next_back().isNone()) {
        // SAFETY: `i` is always less than `n`.
        return Err(n - i)
      }
    }
    return Ok(undefined)
  }

  nth_back(n: number): Option<Item> {
    if (this.advance_back_by(n).isErr())
      return None

    return this.next_back()
  }

  try_rfold<B, F extends (b: B, item: Item) => R, R extends Option<B> = Option<B>>(init: B, f: F): R {
    let acc = init
    let x: Option<Item>
    while ((x = this.next_back()) && x.isSome()) {
      const _acc = f(acc, x.value)
      if (_acc.isNone())
        return None as R
      else
        acc = _acc.value
    }

    return Some(acc) as R
  }

  rfold<B, F extends (b: B, item: Item) => B>(init: B, f: F): B {
    let acc = init
    let x: Option<Item>
    while ((x = this.next_back()) && x.isSome())
      acc = f(acc, x.value)

    return acc
  }

  rfind<P extends (item: Item) => boolean>(predicate: P): Option<Item> {
    function check<T, P extends (item: T) => boolean>(predicate: P): (_: any, t: T) => Option<T> {
      return (_: any, x: T) => {
        if (predicate(x))
          return Some(x)

        return None
      }
    }

    return this.try_fold<Item>(None as any, check(predicate))
  }

  // rposition<P extends (item: Item) => boolean>(predicate: P): Option<number> {
  //   const n = this.len()
  //   function check<T>(predicate: (t: T) => boolean): (u: number, t: T) => ControlFlow<number, number> {
  //     return (i, x) => {
  //       const ii = i - 1
  //       if (predicate(x))
  //         return new ControlFlow.Break<number, number>(ii)
  //       return new ControlFlow.Continue<number, number>(ii)
  //     }
  //   }

  //   this.try_rfold(n, check(p))
  // }

  rev() {
    return new Rev<Item>(this)
  }
}
