import type { Option } from '@starknt/utils'
import { None } from '@starknt/utils'
import { Iterator } from '../traits/base'

export class FilterMap<I extends Iterator<Item>, F extends (item: Item) => Option<unknown>, Item = I extends Iterator<infer Item> ? Item : never, Output = F extends (item: Item) => Option<infer Output> ? Output : never> extends Iterator<Output> {
  protected iter: I
  protected f: F

  constructor(iter: I, f: F) {
    super()
    this.iter = iter
    this.f = f
  }

  next(): Option<Output> {
    let item: Option<Item>
    while ((item = this.iter.next()) && item.isSome()) {
      const mapped = this.f(item.value)
      if (mapped.isSome())
        return mapped as Option<Output>
    }
    return None
  }

  clone(): FilterMap<I, F, Item, Output> {
    return new FilterMap(this.iter.clone(), this.f)
  }
}
