import type { Option } from '@starknt/utils'
import { None } from '@starknt/utils'
import { Iterator } from '../traits/iter'

/**
 * An iterator created from a function.
 */
export class FromFn<const Item> extends Iterator<Item> {
  private f: () => Option<Item>

  constructor(f: () => Option<Item>) {
    super()
    this.f = f
  }

  clone(): FromFn<Item> {
    return new FromFn(this.f)
  }

  next(): Option<Item> {
    return this.f()
  }

  size_hint(): [number, Option<number>] {
    return [0, None]
  }
}

/**
 * Creates an iterator from a function that returns Option<Item>.
 * @param f Function that returns Some(value) for next element, None when done
 * @returns Iterator created from the function
 */
export function from_fn<Item>(f: () => Option<Item>): FromFn<Item> {
  return new FromFn<Item>(f)
}
