import type { Option, Result } from '@starknt/utils'
import { Err, None, Ok, Some } from '@starknt/utils'
import { Iterator } from './base'

/**
 * An iterator able to yield elements from both ends.
 * This is the base class without adapter methods to avoid circular dependencies.
 */
export abstract class DoubleEndedIterator<const Item> extends Iterator<Item> {
  /**
   * Removes and returns an element from the end of the iterator.
   * @returns Some(element) if available, None otherwise
   */
  abstract next_back(): Option<Item>

  len(): number {
    return super.len()
  }

  /**
   * Advances the iterator from the back by n elements.
   * @param n Number of elements to advance
   * @returns Ok(undefined) if successful, Err(remaining) if the iterator was exhausted
   */
  advance_back_by(n: number): Result<undefined, number> {
    for (let i = 0; i < n; i++) {
      if (this.next_back().isNone()) {
        // SAFETY: `i` is always less than `n`.
        return Err(n - i)
      }
    }
    return Ok(undefined)
  }

  /**
   * Returns the nth element from the end of the iterator.
   * @param n Index from the end (0-based)
   * @returns Some(element) if found, None otherwise
   */
  nth_back(n: number): Option<Item> {
    if (this.advance_back_by(n).isErr())
      return None

    return this.next_back()
  }

  /**
   * Folds every element into an accumulator from the right by applying an operation that may fail.
   * @param init Initial accumulator value
   * @param f Operation function
   * @returns Some(final accumulator) if all operations succeed, None otherwise
   */
  try_rfold<B, R extends Option<B> = Option<B>, F extends (b: B, item: Item) => R = (b: B, item: Item) => R>(init: B, f: F): R {
    let acc = init
    let x: Option<Item>
    while ((x = this.next_back()) && x.isSome()) {
      const _acc = f(acc, x.value) as Option<B>
      if (_acc.isNone())
        return None as R
      acc = _acc.value
    }

    return Some(acc) as R
  }

  /**
   * Folds every element into an accumulator from the right by applying an operation.
   * @param init Initial accumulator value
   * @param f Operation function
   * @returns Final accumulator value
   */
  rfold<B, F extends (b: B, item: Item) => B>(init: B, f: F): B {
    let acc = init
    let x: Option<Item>
    while ((x = this.next_back()) && x.isSome())
      acc = f(acc, x.value)

    return acc
  }

  /**
   * Searches for an element from the right that satisfies a predicate.
   * @param predicate Predicate function
   * @returns Some(last matching element) if found, None otherwise
   */
  rfind<P extends (item: Item) => boolean>(predicate: P): Option<Item> {
    function check<T, P extends (item: T) => boolean>(predicate: P): (_: any, t: T) => Option<T> {
      return (_: any, x: T) => {
        if (predicate(x))
          return Some(x)

        return None
      }
    }

    return this.try_rfold<Item, Option<Item>>(None as any, check(predicate))
  }

  /**
   * Searches for an element from the right and returns its index (from the start).
   * @param predicate Predicate function
   * @returns Some(index from start) if found, None otherwise
   */
  rposition<P extends (item: Item) => boolean>(predicate: P): Option<number> {
    const len = this.len()
    let index = len - 1
    let item: Option<Item>
    while ((item = this.next_back()) && item.isSome()) {
      if (predicate(item.value))
        return Some(index)
      index -= 1
    }
    return None
  }
}
