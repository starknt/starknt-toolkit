import { type Option, Some } from '@starknt/utils'
import { type IntoIter, into_iter } from '../option'

export class Once<Item> {
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

export function once<T>(value: T): Once<T> {
  return new Once<T>(into_iter(Some(value)))
}
