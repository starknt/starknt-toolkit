import type { Option } from '@starknt/utils'
import { None, Some } from '@starknt/utils'
import { Iterator } from '../traits/iter'

/**
 * An iterator that repeats an element endlessly.
 */
export class Repeat<const Item> extends Iterator<Item> {
  private value: Item

  constructor(value: Item) {
    super()
    this.value = value
  }

  clone(): Repeat<Item> {
    return new Repeat(this.value)
  }

  next(): Option<Item> {
    return Some(this.value)
  }

  size_hint(): [number, Option<number>] {
    return [0, None]
  }
}

/**
 * Creates an iterator that repeats an element endlessly.
 * @param value The value to repeat
 * @returns Infinite iterator
 */
export function repeat<Item>(value: Item): Repeat<Item> {
  return new Repeat<Item>(value)
}
