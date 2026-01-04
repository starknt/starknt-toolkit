import type { Option, Result } from '@starknt/utils'
import type { IntoIterator } from '../interfaces/iter'
import { Err, None, Ok, Some } from '@starknt/utils'
import { Chain } from '../adapters/chain'
import { Cycle } from '../adapters/cycle'
import { Enumerate } from '../adapters/enumerate'
import { Filter } from '../adapters/filter'
import { FilterMap } from '../adapters/filter_map'
import { FlatMap } from '../adapters/flat_map'
import { Flatten } from '../adapters/flatten'
import { Inspect } from '../adapters/inspect'
import { Intersperse } from '../adapters/intersperse'
import { IntersperseWith } from '../adapters/intersperse_with'
import { Map } from '../adapters/map'
import { MapWhile } from '../adapters/map_while'
import { Peekable } from '../adapters/peekable'
import { Scan } from '../adapters/scan'
import { Skip } from '../adapters/skip'
import { SkipWhile } from '../adapters/skip_while'
import { StepBy } from '../adapters/step_by'
import { Take } from '../adapters/take'
import { TakeWhile } from '../adapters/take_while'
import { Zip } from '../adapters/zip'
import { Sum } from './sum'

// Helper type to extract the value type from Option<T>
export type ExtractOptionType<T> = T extends Option<infer U> ? U extends Option<infer UU> ? ExtractOptionType<UU> : U : never

// Helper type to extract the item type from IntoIterator<T>
export type ExtractIntoIteratorType<T> = T extends IntoIterator<infer U> ? U : never

/**
 * Iterator trait providing adapter methods.
 * Extend this class to create custom iterators.
 */
export abstract class Iterator<const Item> implements IntoIterator<Item> {
  /**
   * Returns the next element of the iterator.
   * @returns Some(value) if there is a next element, None otherwise
   */
  abstract next(): Option<Item>

  /**
   * Converts this iterator into an iterator (no-op).
   * @returns This iterator
   */
  into_iter(): Iterator<Item> {
    return this
  }

  /**
   * Takes two iterators and creates a new iterator over both in sequence.
   * @param other Other iterator to chain
   * @returns Chained iterator
   */
  chain<U extends IntoIterator<Item>>(other: U): Chain<Item> {
    return new Chain(this, other.into_iter())
  }

  /**
   * 'Zips up' two iterators into a single iterator of pairs.
   * @param other Other iterator to zip with
   * @returns Iterator of pairs
   */
  zip<U extends IntoIterator<ItemB>, ItemB = U extends IntoIterator<infer ItemB> ? ItemB : never>(other: U): Zip<Item, ItemB> {
    return new Zip<Item, ItemB>(this, other.into_iter())
  }

  /**
   * Creates an iterator which uses a closure to determine if an element should be yielded.
   * @param predicate Predicate function
   * @returns Filtered iterator
   */
  filter<P extends (item: Item) => boolean>(predicate: P): Filter<Iterator<Item>, P, Item> {
    return new Filter<Iterator<Item>, P, Item>(this, predicate)
  }

  /**
   * Creates an iterator that both filters and maps.
   * @param f Function that returns Option<B>
   * @returns Iterator of mapped values (None values are skipped)
   */
  filter_map<Output>(f: (item: Item) => Option<Output>): FilterMap<Iterator<Item>, (item: Item) => Option<Output>, Item, Output> {
    return new FilterMap<Iterator<Item>, (item: Item) => Option<Output>, Item, Output>(this, f)
  }

  /**
   * Takes a closure and creates an iterator which calls that closure on each element.
   * @param f Mapping function
   * @returns Mapped iterator
   */
  map<Output>(f: (item: Item) => Output): Map<Iterator<Item>, (item: Item) => Output, Item, Output> {
    return new Map<Iterator<Item>, (item: Item) => Output, Item, Output>(this, f)
  }

  /**
   * Sums the elements of an iterator (only for numeric types).
   * @returns Sum of all elements
   */
  sum(): number {
    return Sum.sum<Item>(this)
  }

  /**
   * Creates an iterator which gives the current iteration count as well as the next value.
   * @returns Iterator of [index, value] pairs
   */
  enumerate(): Enumerate<Item> {
    return new Enumerate<Item>(this)
  }

  /**
   * Creates an iterator that yields the first n elements, or fewer if the underlying iterator ends sooner.
   * @param n Number of elements to take
   * @returns Iterator of first n elements
   */
  take(n: number): Take<Item> {
    return new Take<Item>(this, n)
  }

  /**
   * Creates an iterator that skips the first n elements.
   * @param n Number of elements to skip
   * @returns Iterator with first n elements skipped
   */
  skip(n: number): Skip<Item> {
    return new Skip<Item>(this, n)
  }

  /**
   * Repeats an iterator endlessly.
   * @returns Infinite iterator
   */
  cycle(): Cycle<Item> {
    return new Cycle<Item>(this)
  }

  /**
   * Creates an iterator that yields elements based on a predicate.
   * Stops at the first element that doesn't match.
   * @param predicate Predicate function
   * @returns Iterator of elements while predicate is true
   */
  take_while<P extends (item: Item) => boolean>(predicate: P): TakeWhile<Iterator<Item>, P, Item> {
    return new TakeWhile<Iterator<Item>, P, Item>(this, predicate)
  }

  /**
   * Creates an iterator that skips elements based on a predicate.
   * Skips elements while predicate is true, then yields the rest.
   * @param predicate Predicate function
   * @returns Iterator with initial matching elements skipped
   */
  skip_while<P extends (item: Item) => boolean>(predicate: P): SkipWhile<Iterator<Item>, P, Item> {
    return new SkipWhile<Iterator<Item>, P, Item>(this, predicate)
  }

  /**
   * Creates an iterator that works like map, but flattens nested structure.
   * @param f Function that returns an IntoIterator
   * @returns Flattened iterator
   */
  flat_map<Output, F extends (item: Item) => Iterator<unknown>>(f: F): FlatMap<Iterator<Item>, F, Item, Output> {
    return new FlatMap<Iterator<Item>, F, Item, Output>(this, f)
  }

  /**
   * Creates an iterator that flattens nested structure.
   * @returns Flattened iterator
   */
  flatten<InnerItem>(this: Iterator<Iterator<InnerItem>>): Flatten<Iterator<InnerItem>, InnerItem> {
    return new Flatten<Iterator<InnerItem>, InnerItem>(this as any)
  }

  /**
   * Creates an iterator starting at the same point, but stepping by the given amount at each iteration.
   * @param step Step size (must be > 0)
   * @returns Stepped iterator
   */
  step_by(step: number): StepBy<Iterator<Item>, Item> {
    return new StepBy<Iterator<Item>, Item>(this, step)
  }

  /**
   * Creates an iterator that allows peeking at the next element without consuming it.
   * @returns Peekable iterator
   */
  peekable(): Peekable<Iterator<Item>, Item> {
    return new Peekable<Iterator<Item>, Item>(this)
  }

  /**
   * Creates an iterator that scans elements with a state.
   * Similar to fold, but returns an iterator that yields intermediate states.
   * @param initial_state Initial state value
   * @param f Function that takes state and item, returns new state
   * @returns Iterator of state values
   */
  scan<State, Output>(initial_state: State, f: (state: State, item: Item) => Output): Scan<Iterator<Item>, State, (state: State, item: Item) => Output, Item, Output> {
    return new Scan<Iterator<Item>, State, (state: State, item: Item) => Output, Item, Output>(this, initial_state, f)
  }

  /**
   * Creates an iterator that allows inspecting each element with a side-effect function.
   * The element itself is not modified, only observed.
   * @param f Function to call on each element (for side effects)
   * @returns Iterator with inspection
   */
  inspect<F extends (item: Item) => void = (item: Item) => void>(f: F): Inspect<Iterator<Item>, F, Item> {
    return new Inspect<Iterator<Item>, F, Item>(this, f)
  }

  /**
   * Creates an iterator that maps elements to Option values.
   * Stops when encountering the first None.
   * @param f Function that returns Option<Output>
   * @returns Iterator that stops on first None
   */
  map_while<Output>(f: (item: Item) => Option<Output>): MapWhile<Iterator<Item>, (item: Item) => Option<Output>, Item, Output> {
    return new MapWhile<Iterator<Item>, (item: Item) => Option<Output>, Item, Output>(this, f)
  }

  /**
   * Creates an iterator that inserts a separator between elements.
   * @param separator Separator value to insert
   * @returns Iterator with separators inserted
   */
  intersperse(separator: Item): Intersperse<Iterator<Item>, Item> {
    return new Intersperse<Iterator<Item>, Item>(this, separator)
  }

  /**
   * Creates an iterator that inserts separators between elements using a function.
   * @param f Function that generates separator values
   * @returns Iterator with separators inserted
   */
  intersperse_with<F extends () => Item = () => Item>(f: F): IntersperseWith<Iterator<Item>, F, Item> {
    return new IntersperseWith<Iterator<Item>, F, Item>(this, f)
  }

  /**
   * Folds every element into an accumulator by applying an operation.
   * @param init Initial accumulator value
   * @param f Operation function (accumulator, item) => new accumulator
   * @returns Final accumulator value
   */
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

  /**
   * Consumes the iterator, counting the number of elements.
   * @returns The number of elements in the iterator
   */
  count(): number {
    return this.fold(0 as number, (count, _) => count + 1)
  }

  /**
   * Consumes the iterator, returning the last element.
   * @returns Some(last element) if the iterator is not empty, None otherwise
   */
  last(): Option<Item> {
    function some<T>(_: Option<T>, x: T): Option<T> {
      return Some(x)
    }

    return this.fold(None as Option<Item>, some)
  }

  /**
   * Advances the iterator by n elements.
   * @param n Number of elements to advance
   * @returns Ok(undefined) if successful, Err(remaining) if the iterator was exhausted
   */
  advance_by(n: number): Result<undefined, number> {
    for (let i = 0; i < n; i++) {
      if (this.next().isNone()) {
        // SAFETY: `i` is always less than `n`.
        return Err(n - i)
      }
    }

    return Ok(undefined)
  }

  /**
   * Returns the nth element of the iterator.
   * @param n Index of the element to return (0-based)
   * @returns Some(element) if found, None otherwise
   */
  nth(n: number): Option<Item> {
    return this.advance_by(n).isOk() ? this.next() : None
  }

  /**
   * Searches for an element that satisfies a predicate.
   * @param predicate Predicate function
   * @returns Some(first matching element) if found, None otherwise
   */
  find<P extends (item: Item) => boolean>(predicate: P): Option<Item> {
    return this.try_fold<Item>(None as any, (_: any, x) => {
      if (predicate(x))
        return Some(x)

      return None
    })
  }

  /**
   * Applies a function to each element and returns the first non-None result.
   * @param f Function that returns Option<B>
   * @returns Some(first non-None result) if found, None otherwise
   */
  find_map<B, F extends (item: Item) => Option<B> = (item: Item) => Option<B>>(f: F): Option<B> {
    function check<T, B>(f: (t: T) => Option<B>): (_: any, t: T) => Option<B> {
      return (_: any, x: T) => f(x).match<Option<B>>({
        Some: x => Some(x),
        None: () => None,
      })
    }

    return this.try_fold(None as any, check(f))
  }

  /**
   * Calls a closure on each element of an iterator.
   * @param f Closure to call on each element
   */
  for_each<F extends (item: Item) => void>(f: F): void {
    function call<T extends Item>(f: F): (_: any, item: T) => void {
      return (_: any, item: T) => f(item)
    }

    this.fold(None as any, call(f))
  }

  /**
   * Calls a closure on each element of an iterator that may fail.
   * Stops at the first None result.
   * @param f Closure that returns Option
   * @returns None if any call returns None, Some(undefined) otherwise
   */
  try_for_each<F extends (item: Item) => R, R extends Option<any> = Option<undefined>>(f: F): R {
    function call<T, R>(f: (t: T) => R): (_: any, t: T) => R {
      return (_, x) => f(x)
    }

    return this.try_fold(None as R, call<Item, R>(f))
  }

  /**
   * Reduces the elements to a single value using the first element as initial value.
   * @param f Reduction function
   * @returns Some(reduced value) if the iterator is not empty, None otherwise
   */
  reduce<F extends (a: Item, b: Item) => Item>(f: F): Option<Item> {
    const first = this.next()
    if (first.isNone())
      return None
    return Some(this.fold(first.value, f))
  }

  /**
   * Tests if every element of the iterator matches a predicate.
   * @param f Predicate function
   * @returns true if all elements match, false otherwise
   */
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

  /**
   * Tests if any element of the iterator matches a predicate.
   * @param f Predicate function
   * @returns true if any element matches, false otherwise
   */
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

  /**
   * Searches for an element and returns its index.
   * @param predicate Predicate function
   * @returns Some(index) if found, None otherwise
   */
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

  /**
   * Returns a bounds hint on the remaining length of the iterator.
   * @returns [lower bound, Some(upper bound)] or [lower, None] if unbounded
   */
  size_hint(): [number, Option<number>] {
    return [0, None]
  }

  /**
   * Returns the length of the iterator based on size_hint.
   * @returns Lower bound of the size hint
   */
  len(): number {
    const [lower, _upper] = this.size_hint()
    // Note: This assertion is overly defensive, but it checks the invariant
    // guaranteed by the trait. If this trait were rust-internal,
    // we could use debug_assert!; assert_eq! will check all Rust user
    // implementations too.
    return lower
  }

  /**
   * Returns true if the iterator is empty.
   * @returns true if empty, false otherwise
   */
  is_empty(): boolean {
    return this.len() === 0
  }

  /**
   * Collects all elements into an array.
   * @returns Array of all elements
   */
  collect(): Item[] {
    const result: Item[] = []
    let item: Option<Item>
    while ((item = this.next()) && item.isSome())
      result.push(item.value)
    return result
  }

  /**
   * Collects all elements into an array (alias for collect).
   * @returns Array of all elements
   */
  collect_vec(): Item[] {
    return this.collect()
  }

  /**
   * Consumes the iterator, creating two collections from it.
   * @param predicate Predicate function to partition elements
   * @returns [elements where predicate is true, elements where predicate is false]
   */
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

  /**
   * Converts an iterator of pairs into a pair of arrays.
   * @returns [array of first elements, array of second elements]
   */
  unzip<A, B>(this: Iterator<[A, B]>): [A[], B[]] {
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
}
