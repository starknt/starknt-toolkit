import type { Option, Result } from '@starknt/utils'
import type { IntoIterator } from '../interfaces/iter'
import type { Iterator } from '../traits/iter'
import { Err, None, Ok, Some } from '@starknt/utils'

function filter_map_try_fold<T, B, Acc, R extends Option<Acc> = Option<Acc>>(
  f: (t: T) => Option<B>,
  fold: (acc: Acc, b: B) => R,
): (acc: Acc, t: T) => R {
  return (acc: Acc, item: T) => f(item).match<R>({
    Some: x => fold(acc, x),
    None: () => Some(acc) as R,
  })
}

function filter_map_fold<T, B, Acc>(
  f: (t: T) => Option<B>,
  fold: (acc: Acc, b: B) => Acc,
): (acc: Acc, t: T) => Acc {
  return (acc: Acc, item: T) => f(item).match({
    Some: x => fold(acc, x),
    None: () => acc,
  })
}

export class FilterMap<const Item, Output, I extends Iterator<Item> = Iterator<Item>, F extends (item: Item) => Option<Output> = (item: Item) => Option<Output>> implements IntoIterator<Output> {
  protected iter: I
  protected f: F

  constructor(iter: I, f: F) {
    this.iter = iter
    this.f = f
  }

  try_fold<B, R extends Option<B> = Option<B>, Fold extends (b: B, item: Output) => R = (b: B, item: Output) => R>(init: B, f: Fold): R {
    return this.iter.try_fold(init, filter_map_try_fold(this.f, f))
  }

  fold<B, Fold extends (b: B, item: Output) => B = (b: B, item: Output) => B>(init: B, f: Fold): B {
    return this.iter.fold(init, filter_map_fold<Item, Output, B>(this.f, f))
  }

  next(): Option<Output> {
    let item: Option<Item>
    while ((item = this.iter.next()) && item.isSome()) {
      const mapped = this.f(item.value)
      if (mapped.isSome())
        return mapped
    }
    return None
  }

  count(): number {
    return this.fold(0 as number, (count, _) => count + 1)
  }

  last(): Option<Output> {
    function some<T>(_: Option<T>, x: T): Option<T> {
      return Some(x)
    }

    return this.fold(None as Option<Output>, some)
  }

  advance_by(n: number): Result<undefined, number> {
    for (let i = 0; i < n; i++) {
      if (this.next().isNone()) {
        return Err(n - i)
      }
    }

    return Ok(undefined)
  }

  nth(n: number): Option<Output> {
    return this.advance_by(n).isOk() ? this.next() : None
  }

  find<P extends (item: Output) => boolean>(predicate: P): Option<Output> {
    return this.try_fold<Output>(None as any, (_: any, x) => {
      if (predicate(x))
        return Some(x)

      return None
    })
  }

  find_map<B, F extends (item: Output) => Option<B> = (item: Output) => Option<B>>(f: F): Option<B> {
    function check<T, B>(f: (t: T) => Option<B>): (_: any, t: T) => Option<B> {
      return (_: any, x: T) => f(x).match<Option<B>>({
        Some: x => Some(x),
        None: () => None,
      })
    }

    return this.try_fold(None as any, check(f))
  }

  for_each<F extends (item: Output) => void>(f: F): void {
    function call<T extends Output>(f: F): (_: any, item: T) => void {
      return (_: any, item: T) => f(item)
    }

    this.fold(None as any, call(f))
  }

  try_for_each<F extends (item: Output) => R, R extends Option<any> = Option<undefined>>(f: F): R {
    function call<T, R>(f: (t: T) => R): (_: any, t: T) => R {
      return (_, x) => f(x)
    }

    return this.try_fold(None as R, call<Output, R>(f))
  }

  reduce<F extends (a: Output, b: Output) => Output>(f: F): Option<Output> {
    const first = this.next()
    if (first.isNone())
      return None
    return Some(this.fold(first.value, f))
  }

  all<F extends (item: Output) => boolean>(f: F): boolean {
    function check<T>(f: (t: T) => boolean): (_: any, t: T) => Option<T> {
      return (_, x) => {
        if (f(x))
          return None

        return Some(x)
      }
    }

    return this.try_fold(void 0 as any, check<Output>(f)).isNone()
  }

  any<F extends (t: Output) => boolean>(f: F): boolean {
    function check<T>(f: (t: T) => boolean): (_: any, t: T) => Option<T> {
      return (_, x) => {
        if (f(x))
          return Some(x)

        return None
      }
    }

    return this.try_fold(void 0 as any, check(f)).isSome()
  }

  position<P extends (item: Output) => boolean>(predicate: P): Option<number> {
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

  collect(): Output[] {
    const result: Output[] = []
    let item: Option<Output>
    while ((item = this.next()) && item.isSome())
      result.push(item.value)
    return result
  }

  collect_vec(): Output[] {
    return this.collect()
  }

  partition<P extends (item: Output) => boolean>(predicate: P): [Output[], Output[]] {
    const left: Output[] = []
    const right: Output[] = []
    let item: Option<Output>
    while ((item = this.next()) && item.isSome()) {
      if (predicate(item.value))
        left.push(item.value)
      else
        right.push(item.value)
    }
    return [left, right]
  }

  unzip<A, B>(this: FilterMap<[A, B], [A, B], any, any>): [A[], B[]] {
    const left: A[] = []
    const right: B[] = []
    let item: Option<[A, B]>
    while ((item = this.next()) && item.isSome()) {
      left.push(item.value[0])
      right.push(item.value[1])
    }
    return [left, right]
  }

  * [Symbol.iterator](): IterableIterator<Option<Output>> {
    yield this.next()
  }

  * [Symbol.asyncIterator](): IterableIterator<Option<Output>> {
    yield this.next()
  }

  into_iter(): Iterator<Output> {
    return this as unknown as Iterator<Output>
  }
}
