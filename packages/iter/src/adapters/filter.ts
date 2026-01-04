import type { Option, Result } from '@starknt/utils'
import type { Iterator } from '../traits/iter'
import { Err, None, Ok, Some } from '@starknt/utils'

function filter_try_fold<T, Acc, R extends Option<Acc> = Option<Acc>>(
  predicate: (item: T) => boolean,
  fold: (acc: Acc, t: T) => R,
): (acc: Acc, t: T) => R {
  return (acc: Acc, item: T) => {
    if (predicate(item))
      return fold(acc, item)

    return Some(acc) as R
  }
}

function filter_fold<T, Acc>(
  predicate: (item: T) => boolean,
  fold: (acc: Acc, t: T) => Acc,
): (acc: Acc, t: T) => Acc {
  return (acc: Acc, item: T) => {
    if (predicate(item))
      return fold(acc, item)

    return acc
  }
}

export class Filter<const Item, I extends Iterator<Item> = Iterator<Item>, P extends (item: Item) => boolean = (item: Item) => boolean> {
  protected iter: I
  protected predicate: P

  constructor(iter: I, predicate: P) {
    this.iter = iter
    this.predicate = predicate
  }

  try_fold<B, R extends Option<B> = Option<B>, F extends (b: B, item: Item) => R = (b: B, item: Item) => R>(init: B, f: F): R {
    return this.iter.try_fold(init, filter_try_fold(this.predicate, f))
  }

  fold<B, F extends (b: B, item: Item) => B = (b: B, item: Item) => B>(init: B, f: F): B {
    return this.iter.fold(init, filter_fold(this.predicate, f))
  }

  next(): Option<Item> {
    let item: Option<Item>
    while ((item = this.iter.next()) && item.isSome()) {
      if (this.predicate(item.value))
        return item
    }
    return None
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

  unzip<A, B>(this: Filter<[A, B], any, any>): [A[], B[]] {
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
