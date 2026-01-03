import type { Option } from '@starknt/utils'
import type { CloneableIterator, IntoIterator } from '../interfaces/iter'
import { Chain } from '../adapters/chain'
import { Cycle } from '../adapters/cycle'
import { Enumerate } from '../adapters/enumerate'
import { Filter } from '../adapters/filter'
import { FilterMap } from '../adapters/filter_map'
import { FlatMap } from '../adapters/flat_map'
import { Flatten } from '../adapters/flatten'
import { Map } from '../adapters/map'
import { Peekable } from '../adapters/peekable'
import { Skip } from '../adapters/skip'
import { SkipWhile } from '../adapters/skip_while'
import { StepBy } from '../adapters/step_by'
import { Take } from '../adapters/take'
import { TakeWhile } from '../adapters/take_while'
import { Zip } from '../adapters/zip'
import { BaseIterator } from './base'
import { Sum } from './sum'

// Helper type to extract the value type from Option<T>
type ExtractOptionType<T> = T extends Option<infer U> ? U : never

// Helper type to extract the item type from IntoIterator<T>
type ExtractIntoIteratorType<T> = T extends IntoIterator<infer U> ? U : never

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
  chain<U extends IntoIterator<Item>>(other: U): Chain<Iterator<Item>, Iterator<Item>, Item> {
    return new Chain(this, other.into_iter())
  }

  /**
   * 'Zips up' two iterators into a single iterator of pairs.
   * @param other Other iterator to zip with
   * @returns Iterator of pairs
   */
  zip<ItemB, U extends IntoIterator<ItemB> = Iterator<ItemB>>(other: U): Zip<Item, ItemB> {
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
  filter_map<F extends (item: Item) => Option<any>>(f: F): FilterMap<Item, ExtractOptionType<ReturnType<F>>> {
    return new FilterMap<Item, ExtractOptionType<ReturnType<F>>>(this, f)
  }

  /**
   * Takes a closure and creates an iterator which calls that closure on each element.
   * @param f Mapping function
   * @returns Mapped iterator
   */
  map<F extends (item: Item) => any = (item: Item) => any>(f: F): Map<Item, ReturnType<F>> {
    return new Map<Item, ReturnType<F>>(this, f)
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
  flat_map<F extends (item: Item) => IntoIterator<any>>(f: F): FlatMap<Item, ExtractIntoIteratorType<ReturnType<F>>> {
    return new FlatMap<Item, ExtractIntoIteratorType<ReturnType<F>>>(this, f)
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
}
