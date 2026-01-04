import type { Option } from '@starknt/utils'
import type { CloneableIterator, IntoIterator } from '../interfaces/iter'
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
import { BaseIterator } from './base'
import { Sum } from './sum'

export interface Iterator<Item> {
  next(): Option<Item>
}

/**
 * Iterator trait providing adapter methods.
 * Extend this class to create custom iterators.
 */
export abstract class Iterator<Item> extends BaseIterator<Item> implements CloneableIterator<Item>, IntoIterator<Item> {
  /**
   * Creates a copy of the iterator.
   * @returns A new iterator with the same state
   */
  clone(): Iterator<Item> {
    return Object.assign(Object.create(Object.getPrototypeOf(this)), this)
  }

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
  filter<P extends (item: Item) => boolean>(predicate: P): Filter<Item> {
    return new Filter<Item>(this, predicate)
  }

  /**
   * Creates an iterator that both filters and maps.
   * @param f Function that returns Option<B>
   * @returns Iterator of mapped values (None values are skipped)
   */
  filter_map<Output>(f: (item: Item) => Option<Output>): FilterMap<Item, Output> {
    return new FilterMap<Item, Output>(this, f)
  }

  /**
   * Takes a closure and creates an iterator which calls that closure on each element.
   * @param f Mapping function
   * @returns Mapped iterator
   */
  map<Output>(f: (item: Item) => Output): Map<Item, Output> {
    return new Map<Item, Output>(this, f)
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
  take_while<P extends (item: Item) => boolean>(predicate: P): TakeWhile<Item> {
    return new TakeWhile<Item>(this, predicate)
  }

  /**
   * Creates an iterator that skips elements based on a predicate.
   * Skips elements while predicate is true, then yields the rest.
   * @param predicate Predicate function
   * @returns Iterator with initial matching elements skipped
   */
  skip_while<P extends (item: Item) => boolean>(predicate: P): SkipWhile<Item> {
    return new SkipWhile<Item>(this, predicate)
  }

  /**
   * Creates an iterator that works like map, but flattens nested structure.
   * @param f Function that returns an IntoIterator
   * @returns Flattened iterator
   */
  flat_map<Output>(f: (item: Item) => IntoIterator<Output>): FlatMap<Item, Output> {
    return new FlatMap<Item, Output>(this, f)
  }

  /**
   * Creates an iterator that flattens nested structure.
   * @returns Flattened iterator
   */
  flatten<InnerItem>(this: Iterator<Iterator<InnerItem>>): Flatten<InnerItem> {
    return new Flatten<InnerItem>(this as any)
  }

  /**
   * Creates an iterator starting at the same point, but stepping by the given amount at each iteration.
   * @param step Step size (must be > 0)
   * @returns Stepped iterator
   */
  step_by(step: number): StepBy<Item> {
    return new StepBy<Item>(this, step)
  }

  /**
   * Creates an iterator that allows peeking at the next element without consuming it.
   * @returns Peekable iterator
   */
  peekable(): Peekable<Item> {
    return new Peekable<Item>(this)
  }

  /**
   * Creates an iterator that scans elements with a state.
   * Similar to fold, but returns an iterator that yields intermediate states.
   * @param initial_state Initial state value
   * @param f Function that takes state and item, returns new state
   * @returns Iterator of state values
   */
  scan<State, Output>(initial_state: State, f: (state: State, item: Item) => Output): Scan<Item, State, Output> {
    return new Scan<Item, State, Output>(this, initial_state, f)
  }

  /**
   * Creates an iterator that allows inspecting each element with a side-effect function.
   * The element itself is not modified, only observed.
   * @param f Function to call on each element (for side effects)
   * @returns Iterator with inspection
   */
  inspect<F extends (item: Item) => void = (item: Item) => void>(f: F): Inspect<Item> {
    return new Inspect<Item>(this, f)
  }

  /**
   * Creates an iterator that maps elements to Option values.
   * Stops when encountering the first None.
   * @param f Function that returns Option<Output>
   * @returns Iterator that stops on first None
   */
  map_while<Output>(f: (item: Item) => Option<Output>): MapWhile<Item, Output> {
    return new MapWhile<Item, Output>(this, f)
  }

  /**
   * Creates an iterator that inserts a separator between elements.
   * @param separator Separator value to insert
   * @returns Iterator with separators inserted
   */
  intersperse(separator: Item): Intersperse<Item> {
    return new Intersperse<Item>(this, separator)
  }

  /**
   * Creates an iterator that inserts separators between elements using a function.
   * @param f Function that generates separator values
   * @returns Iterator with separators inserted
   */
  intersperse_with<F extends () => Item = () => Item>(f: F): IntersperseWith<Item> {
    return new IntersperseWith<Item>(this, f)
  }
}
