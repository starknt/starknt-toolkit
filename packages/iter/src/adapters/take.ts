import type { Option } from '@starknt/utils'
import { None } from '@starknt/utils'
import { Iterator } from '../traits/base'

export class Take<const Item, I extends Iterator<Item> = Iterator<Item>> extends Iterator<Item> {
  protected iter: I
  protected n: number

  constructor(iter: I, n: number) {
    super()
    this.iter = iter
    this.n = n
  }

  next(): Option<Item> {
    if (this.n !== 0) {
      this.n -= 1
      return this.iter.next()
    }

    return None
  }

  nth(n: number): Option<Item> {
    if (this.n > n) {
      this.n -= n + 1
      return this.iter.nth(n)
    }
    else {
      if (this.n > 0) {
        this.iter.nth(this.n - 1)
        this.n = 0
      }
      return None
    }
  }
}
