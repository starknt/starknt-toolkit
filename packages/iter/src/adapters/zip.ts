import type { Option, Result } from '@starknt/utils'
import type { IntoIterator } from '../interfaces/iter'
import type { Iterator } from '../traits/iter'
import { Err, None, Ok, Some } from '@starknt/utils'

export class Zip<const ItemA, const ItemB> implements IntoIterator<[ItemA, ItemB]> {
  protected a: Iterator<ItemA>
  protected b: Iterator<ItemB>
  protected index: number

  constructor(a: Iterator<ItemA>, b: Iterator<ItemB>) {
    this.a = a
    this.b = b
    this.index = 0
  }

  next(): Option<[ItemA, ItemB]> {
    const x = this.a.next()
    const y = this.b.next()

    if (x.isNone() || y.isNone())
      return None

    return Some([x.value, y.value] as [ItemA, ItemB])
  }

  nth(n: number): Option<[ItemA, ItemB]> {
    let x!: Option<[ItemA, ItemB]>
    while ((x = this.next()) && x.isSome()) {
      if (n === 0)
        return x

      n -= 1
    }
    return None
  }

  try_fold<B, R extends Option<B> = Option<B>, Fold extends (b: B, item: [ItemA, ItemB]) => R = (b: B, item: [ItemA, ItemB]) => R>(init: B, f: Fold): R {
    let acc = init
    let x: Option<[ItemA, ItemB]>
    while ((x = this.next()) && x.isSome()) {
      const _acc = f(acc, x.value) as Option<B>
      if (_acc.isNone())
        return None as R
      acc = _acc.value
    }

    return Some(acc) as R
  }

  fold<B, Fold extends (b: B, item: [ItemA, ItemB]) => B = (b: B, item: [ItemA, ItemB]) => B>(init: B, f: Fold): B {
    let acc = init
    let x: Option<[ItemA, ItemB]>
    while ((x = this.next()) && x.isSome())
      acc = f(acc, x.value)

    return acc
  }

  count(): number {
    return this.fold(0 as number, (count, _) => count + 1)
  }

  last(): Option<[ItemA, ItemB]> {
    function some<T>(_: Option<T>, x: T): Option<T> {
      return Some(x)
    }

    return this.fold(None as Option<[ItemA, ItemB]>, some)
  }

  advance_by(n: number): Result<undefined, number> {
    for (let i = 0; i < n; i++) {
      if (this.next().isNone()) {
        return Err(n - i)
      }
    }

    return Ok(undefined)
  }

  find<P extends (item: [ItemA, ItemB]) => boolean>(predicate: P): Option<[ItemA, ItemB]> {
    return this.try_fold<[ItemA, ItemB]>(None as any, (_: any, x) => {
      if (predicate(x))
        return Some(x)

      return None
    })
  }

  find_map<B, F extends (item: [ItemA, ItemB]) => Option<B> = (item: [ItemA, ItemB]) => Option<B>>(f: F): Option<B> {
    function check<T, B>(f: (t: T) => Option<B>): (_: any, t: T) => Option<B> {
      return (_: any, x: T) => f(x).match<Option<B>>({
        Some: x => Some(x),
        None: () => None,
      })
    }

    return this.try_fold(None as any, check(f))
  }

  for_each<F extends (item: [ItemA, ItemB]) => void>(f: F): void {
    function call<T extends [ItemA, ItemB]>(f: F): (_: any, item: T) => void {
      return (_: any, item: T) => f(item)
    }

    this.fold(None as any, call(f))
  }

  try_for_each<F extends (item: [ItemA, ItemB]) => R, R extends Option<any> = Option<undefined>>(f: F): R {
    function call<T, R>(f: (t: T) => R): (_: any, t: T) => R {
      return (_, x) => f(x)
    }

    return this.try_fold(None as R, call<[ItemA, ItemB], R>(f))
  }

  reduce<F extends (a: [ItemA, ItemB], b: [ItemA, ItemB]) => [ItemA, ItemB]>(f: F): Option<[ItemA, ItemB]> {
    const first = this.next()
    if (first.isNone())
      return None
    return Some(this.fold(first.value, f))
  }

  all<F extends (item: [ItemA, ItemB]) => boolean>(f: F): boolean {
    function check<T>(f: (t: T) => boolean): (_: any, t: T) => Option<T> {
      return (_, x) => {
        if (f(x))
          return None

        return Some(x)
      }
    }

    return this.try_fold(void 0 as any, check<[ItemA, ItemB]>(f)).isNone()
  }

  any<F extends (t: [ItemA, ItemB]) => boolean>(f: F): boolean {
    function check<T>(f: (t: T) => boolean): (_: any, t: T) => Option<T> {
      return (_, x) => {
        if (f(x))
          return Some(x)

        return None
      }
    }

    return this.try_fold(void 0 as any, check(f)).isSome()
  }

  position<P extends (item: [ItemA, ItemB]) => boolean>(predicate: P): Option<number> {
    let acc = 0
    function check<T>(predicate: (t: T) => boolean): (_: any, t: T) => Option<number> {
      return (_, x) => {
        if (predicate(x)) {
          return Some(acc)
        }
        else {
          acc += 1
          return None
        }
      }
    }

    return this.try_fold(void 0 as any, check(predicate))
  }

  size_hint(): [number, Option<number>] {
    return [0, None]
  }

  len(): number {
    const [lower, _upper] = this.size_hint()
    return lower
  }

  is_empty(): boolean {
    return this.len() === 0
  }

  collect(): [ItemA, ItemB][] {
    const result: [ItemA, ItemB][] = []
    let item: Option<[ItemA, ItemB]>
    while ((item = this.next()) && item.isSome())
      result.push(item.value)
    return result
  }

  collect_vec(): [ItemA, ItemB][] {
    return this.collect()
  }

  partition<P extends (item: [ItemA, ItemB]) => boolean>(predicate: P): [[ItemA, ItemB][], [ItemA, ItemB][]] {
    const left: [ItemA, ItemB][] = []
    const right: [ItemA, ItemB][] = []
    let item: Option<[ItemA, ItemB]>
    while ((item = this.next()) && item.isSome()) {
      if (predicate(item.value))
        left.push(item.value)
      else
        right.push(item.value)
    }
    return [left, right]
  }

  unzip<A, B>(this: Zip<[A, B], [A, B]>): [A[], B[]] {
    const left: A[] = []
    const right: B[] = []
    let item: Option<[A, B]>
    while ((item = this.next()) && item.isSome()) {
      left.push(item.value[0])
      right.push(item.value[1])
    }
    return [left, right]
  }

  * [Symbol.iterator](): IterableIterator<Option<[ItemA, ItemB]>> {
    yield this.next()
  }

  * [Symbol.asyncIterator](): IterableIterator<Option<[ItemA, ItemB]>> {
    yield this.next()
  }

  into_iter(): Iterator<[ItemA, ItemB]> {
    return this as unknown as Iterator<[ItemA, ItemB]>
  }
}
