import type { Option } from '@starknt/utils'
import type { IntoIter } from '../option'
import { Some } from '@starknt/utils'
import { into_iter } from '../option'

/**
 * An iterator that yields a single element.
 */
export class Once<const Item> {
  private inner!: IntoIter<Item>

  constructor(inner: IntoIter<Item>) {
    this.inner = inner
  }

  next(): Option<Item> {
    return this.inner.next()
  }

  size_hint(): [number, Option<number>] {
    return this.inner.size_hint()
  }

  next_back(): Option<Item> {
    return this.inner.next_back()
  }
}

/**
 * Creates an iterator that yields a single element.
 * @param value The value to yield
 * @returns Iterator that yields the value once
 */
export function once<T>(value: T): Once<T> {
  return new Once<T>(into_iter(Some(value)))
}
