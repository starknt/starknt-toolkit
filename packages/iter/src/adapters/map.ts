import type { Option } from '@starknt/utils'
import { Iterator } from '../traits/base'

export class Map<I extends Iterator<Item>, F extends (item: Item) => unknown, Item = I extends Iterator<infer Item> ? Item : never, Output = F extends (item: Item) => infer Output ? Output : never> extends Iterator<Output> {
  protected iter: I
  protected f: F

  constructor(iter: I, f: F) {
    super()
    this.iter = iter
    this.f = f
  }

  next(): Option<Output> {
    return this.iter.next().map(this.f as (item: Item) => Output)
  }

  clone(): Map<I, F, Item, Output> {
    return new Map(this.iter.clone(), this.f)
  }
}
