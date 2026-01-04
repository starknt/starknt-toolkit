import type { Option } from '@starknt/utils'
import { None } from '@starknt/utils'
import { Iterator } from '../traits/iter'

export class SkipWhile<I extends Iterator<Item>, P extends (item: Item) => boolean, Item = I extends Iterator<infer Item> ? Item : never> extends Iterator<Item> {
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
    while (this.flag) {
      const item = this.iter.next()
      if (item.isNone()) {
        this.flag = false
        return None
      }

      if (!this.predicate(item.value)) {
        this.flag = false
        return item
      }
    }

    return this.iter.next()
  }
}
