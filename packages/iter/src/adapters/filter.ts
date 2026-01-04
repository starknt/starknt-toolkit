import type { Option } from '@starknt/utils'
import { None } from '@starknt/utils'
import { Iterator } from '../traits/base'

export class Filter<I extends Iterator<Item>, P extends (item: Item) => boolean, Item = I extends Iterator<infer Item> ? Item : never> extends Iterator<Item> {
  protected iter: I
  protected predicate: P

  constructor(iter: I, predicate: P) {
    super()
    this.iter = iter
    this.predicate = predicate
  }

  next(): Option<Item> {
    let item: Option<Item>
    while ((item = this.iter.next()) && item.isSome()) {
      if (this.predicate(item.value))
        return item
    }
    return None
  }
}
