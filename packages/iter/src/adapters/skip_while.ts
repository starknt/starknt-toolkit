import type { Option } from '@starknt/utils'
import type { Iterator } from '../traits/iter'
import { None } from '@starknt/utils'

export class SkipWhile<const Item, I extends Iterator<Item> = Iterator<Item>, P extends (item: Item) => boolean = (item: Item) => boolean> {
  protected iter: I
  protected predicate: P
  protected flag: boolean

  constructor(iter: I, predicate: P) {
    this.iter = iter
    this.predicate = predicate
    this.flag = false
  }

  next(): Option<Item> {
    let item: Option<Item>
    if (!this.flag) {
      while ((item = this.iter.next()) && item.isSome()) {
        if (!this.predicate(item.value)) {
          this.flag = true
          return item
        }
      }
      return None
    }
    return this.iter.next()
  }
}
