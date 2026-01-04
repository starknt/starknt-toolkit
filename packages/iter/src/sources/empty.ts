import type { Option } from '@starknt/utils'
import { None, Some } from '@starknt/utils'
import { Iterator } from '../traits/iter'

/**
 * An iterator that yields no elements.
 */
export class Empty<const Item> extends Iterator<Item> {
  clone(): Empty<Item> {
    return new Empty()
  }

  next(): Option<Item> {
    return None
  }

  size_hint(): [number, Option<number>] {
    return [0, Some(0)]
  }
}

/**
 * Creates an iterator that yields no elements.
 * @returns Empty iterator
 */
export function empty<Item>(): Empty<Item> {
  return new Empty<Item>()
}
