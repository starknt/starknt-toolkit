import type { Option } from '@starknt/utils'
import type { Iterator } from '../traits/iter'
import { None } from '@starknt/utils'

export class TakeWhile<const Item, I extends Iterator<Item> = Iterator<Item>, P extends (item: Item) => boolean = (item: Item) => boolean> {
  protected iter: I
  protected predicate: P
  protected flag: boolean

  constructor(iter: I, predicate: P) {
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
}
