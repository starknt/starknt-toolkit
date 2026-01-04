import type { Option, Result } from '@starknt/utils'
import type { IntoIterator } from '../interfaces/iter'
import type { Iterator } from '../traits/iter'
import { Err, None, Ok, Some } from '@starknt/utils'

function and_then_or_clear<T, U>(opt: Option<T>, f: (item: T) => Option<U>): Option<U> {
  if (opt.isNone())
    return opt
  const x = f(opt.value)
  if (x.isNone())
    opt = None

  return x
}

export class Chain<const Item> implements IntoIterator<Item> {
  protected a: Option<Iterator<Item>>
  protected b: Option<Iterator<Item>>

  constructor(a: Iterator<Item>, b: Iterator<Item>) {
    this.a = Some(a)
    this.b = Some(b)
  }

  next(): Option<Item> {
    if (this.a.isNone())
      return None

    return and_then_or_clear(
      this.a,
      (a: Iterator<Item>) => a.next(),
    ).orElse(() => this.b.isSome() ? this.b.value.next() : None)
  }

  try_fold<B, R extends Option<B> = Option<B>, F extends (b: B, item: Item) => R = (b: B, item: Item) => R>(init: B, f: F): R {
    let acc = init

    // Fold first iterator
    if (this.a.isSome()) {
      const _acc = this.a.value.try_fold(acc, f)
      if (_acc.isNone())
        return None as R
      acc = _acc.value
    }

    // Fold second iterator
    if (this.b.isSome()) {
      const _acc = this.b.value.try_fold(acc, f)
      if (_acc.isNone())
        return None as R
      acc = _acc.value
    }

    return Some(acc) as R
  }

  fold<B, F extends (b: B, item: Item) => B = (b: B, item: Item) => B>(init: B, f: F): B {
    let acc = init

    if (this.a.isSome())
      acc = this.a.value.fold(acc, f)

    if (this.b.isSome())
      acc = this.b.value.fold(acc, f)

    return acc
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

  last(): Option<Item> {
    const a_last = this.a.andThen(a => a.last())
    const b_last = this.b.andThen(b => b.last())
    return b_last.or(a_last)
  }

  advance_by(n: number): Result<undefined, number> {
    for (let i = 0; i < n; i++) {
      if (this.next().isNone()) {
        return Err(n - i)
      }
    }

    return Ok(undefined)
  }

  nth(n: number): Option<Item> {
    return this.advance_by(n).isOk() ? this.next() : None
  }

  find<P extends (item: Item) => boolean>(predicate: P): Option<Item> {
    return and_then_or_clear(this.a, (a: Iterator<Item>) => a.find(predicate))
      .orElse(() => this.b.isSome() ? this.b.value.find(predicate) : None)
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
      return (_, _x) => {
        if (predicate(_x)) {
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

  collect(): Item[] {
    const result: Item[] = []
    let item: Option<Item>
    while ((item = this.next()) && item.isSome())
      result.push(item.value)
    return result
  }

  collect_vec(): Item[] {
    return this.collect()
  }

  partition<P extends (item: Item) => boolean>(predicate: P): [Item[], Item[]] {
    const left: Item[] = []
    const right: Item[] = []
    let item: Option<Item>
    while ((item = this.next()) && item.isSome()) {
      if (predicate(item.value))
        left.push(item.value)
      else
        right.push(item.value)
    }
    return [left, right]
  }

  unzip<A, B>(this: Chain<[A, B]>): [A[], B[]] {
    const left: A[] = []
    const right: B[] = []
    let item: Option<[A, B]>
    while ((item = this.next()) && item.isSome()) {
      left.push(item.value[0])
      right.push(item.value[1])
    }
    return [left, right]
  }

  * [Symbol.iterator](): IterableIterator<Option<Item>> {
    yield this.next()
  }

  * [Symbol.asyncIterator](): IterableIterator<Option<Item>> {
    yield this.next()
  }

  into_iter(): Iterator<Item> {
    return this as unknown as Iterator<Item>
  }
}
