import type { Option } from '@starknt/utils'
import { None } from '@starknt/utils'
import { Iterator } from '../traits/base'

export class TakeWhile<I extends Iterator<Item>, P extends (item: Item) => boolean, Item = I extends Iterator<infer Item> ? Item : never> extends Iterator<Item> {
  protected iter: I
  protected predicate: P
  protected flag: boolean

  constructor(iter: I, predicate: P) {
    super()
    this.iter = iter
    this.predicate = predicate
    this.flag = true
  }

  next(): Option<Item> {
    if (!this.flag)
      return None

    const item = this.iter.next()
    if (item.isNone()) {
      this.flag = false
      return None
    }

    if (this.predicate(item.value))
      return item

    this.flag = false
    return None
  }

  clone(): TakeWhile<I, P, Item> {
    return new TakeWhile(this.iter.clone() as I, this.predicate)
  }

  size_hint(): [number, Option<number>] {
    // TakeWhile may stop early, so lower bound is 0
    // Upper bound is the same as the underlying iterator
    const [_, upper] = this.iter.size_hint()
    return [0, upper]
  }
}
