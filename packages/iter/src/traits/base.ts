import type { Option, Result } from '@starknt/utils'
import { Err, None, Ok, Some } from '@starknt/utils'

export abstract class BaseIterator<Item> {
  abstract next(): Option<Item>

  fold<B, F extends (b: B, item: Item) => B = (b: B, item: Item) => B>(init: B, f: F) {
    let acc = init
    let x: Option<Item>
    while ((x = this.next()) && x.isSome())
      acc = f(acc, x.value)

    return acc
  }

  try_fold<B, R extends Option<B> = Option<B>, F extends (b: B, item: Item) => R = (b: B, item: Item) => R>(init: B, f: F): R {
    let acc = init
    let x: Option<Item>
    while ((x = this.next()) && x.isSome()) {
      const _acc = f(acc, x.value) as Option<B>
      if (_acc.isNone())
        return None as R
      acc = _acc.value
    }

    return Some(acc) as R
  }

  count(): number {
    return this.fold(0 as number, (count, _) => count + 1)
  }

  last(): Option<Item> {
    function some<T>(_: Option<T>, x: T): Option<T> {
      return Some(x)
    }

    return this.fold(None as Option<Item>, some)
  }

  advance_by(n: number): Result<undefined, number> {
    for (let i = 0; i < n; i++) {
      if (this.next().isNone()) {
        // SAFETY: `i` is always less than `n`.
        return Err(n - i)
      }
    }

    return Ok(undefined)
  }

  nth(n: number): Option<Item> {
    return this.advance_by(n).isOk() ? this.next() : None
  }

  find<P extends (item: Item) => boolean>(predicate: P): Option<Item> {
    return this.try_fold<Item>(None as any, (_: any, x) => {
      if (predicate(x))
        return Some(x)

      return None
    })
  }

  find_map<B, F extends (item: Item) => Option<B> = (item: Item) => Option<B>>(f: F): Option<B> {
    function check<T, B>(f: (t: T) => Option<B>): (_: any, t: T) => Option<B> {
      return (_: any, x: T) => f(x).match<Option<B>>({
        Some: x => Some(x),
        None: () => None,
      })
    }

    return this.try_fold(None as any, check(f))
  }

  for_each<F extends (item: Item) => void>(f: F): void {
    function call<T extends Item>(f: F): (_: any, item: T) => void {
      return (_: any, item: T) => f(item)
    }

    this.fold(None as any, call(f))
  }

  try_for_each<F extends (item: Item) => R, R extends Option<any> = Option<undefined>>(f: F): R {
    function call<T, R>(f: (t: T) => R): (_: any, t: T) => R {
      return (_, x) => f(x)
    }

    return this.try_fold(None as R, call<Item, R>(f))
  }

  reduce<F extends (a: Item, b: Item) => Item>(f: F): Option<Item> {
    const first = this.next()
    if (first.isNone())
      return None
    return Some(this.fold(first.value, f))
  }

  all<F extends (item: Item) => boolean>(f: F): boolean {
    function check<T>(f: (t: T) => boolean): (_: any, t: T) => Option<T> {
      return (_, x) => {
        if (f(x))
          return None

        return Some(x)
      }
    }

    return this.try_fold(void 0 as any, check<Item>(f)).isNone()
  }

  any<F extends (t: Item) => boolean>(f: F): boolean {
    function check<T>(f: (t: T) => boolean): (_: any, t: T) => Option<T> {
      return (_, x) => {
        if (f(x))
          return Some(x)

        return None
      }
    }

    return this.try_fold(void 0 as any, check(f)).isSome()
  }

  position<P extends (item: Item) => boolean>(predicate: P): Option<number> {
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
    // Note: This assertion is overly defensive, but it checks the invariant
    // guaranteed by the trait. If this trait were rust-internal,
    // we could use debug_assert!; assert_eq! will check all Rust user
    // implementations too.
    return lower
  }

  is_empty(): boolean {
    return this.len() === 0
  }

  *[Symbol.iterator](): IterableIterator<Option<Item>> {
    yield this.next()
  }

  *[Symbol.asyncIterator](): IterableIterator<Option<Item>> {
    yield this.next()
  }
}
