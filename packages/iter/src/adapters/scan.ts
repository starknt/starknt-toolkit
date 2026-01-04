import type { Option } from '@starknt/utils'
import { None, Some } from '@starknt/utils'
import { Iterator } from '../traits/base'

/**
 * Iterator adapter that scans elements with a state.
 * Similar to fold, but returns an iterator that yields intermediate states.
 */
export class Scan<I extends Iterator<Item>, State, F extends (state: State, item: Item) => unknown, Item = I extends Iterator<infer Item> ? Item : never, Output = F extends (state: State, item: Item) => infer Output ? Output : State> extends Iterator<Output> {
  protected iter: I
  protected state: State
  protected f: F
  protected finished: boolean

  constructor(iter: I, initial_state: State, f: F) {
    super()
    this.iter = iter
    this.state = initial_state
    this.f = f
    this.finished = false
  }

  /**
   * Returns the next element.
   * @returns Some(next element) if available, None otherwise
   */
  next(): Option<Output> {
    if (this.finished)
      return None

    const item = this.iter.next()
    if (item.isNone()) {
      this.finished = true
      return None
    }

    const new_state = (this.f as (state: State, item: Item) => Output)(this.state, item.value)
    this.state = new_state as unknown as State
    return Some(new_state) as Option<Output>
  }

  clone(): Scan<I, State, F, Item, Output> {
    return new Scan(this.iter.clone(), this.state, this.f)
  }

  size_hint(): [number, Option<number>] {
    return this.iter.size_hint()
  }
}
