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

  clone(): Filter<I, P, Item> {
    return new Filter(this.iter.clone(), this.predicate)
  }

  size_hint(): [number, Option<number>] {
    // Filter may remove elements, so lower bound is 0
    // Upper bound is the same as the underlying iterator
    const [_, upper] = this.iter.size_hint()
    return [0, upper]
  }
}
