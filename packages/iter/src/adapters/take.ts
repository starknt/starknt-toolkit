import type { Option } from '@starknt/utils'
import { None, Some } from '@starknt/utils'
import { Iterator } from '../traits/base'

export class Take<I extends Iterator<Item>, Item = I extends Iterator<infer Item> ? Item : never> extends Iterator<Item> {
  protected iter: I
  protected n: number
  private original_iter: I
  private original_n: number

  constructor(iter: I, n: number) {
    super()
    this.iter = iter
    this.n = n
    this.original_iter = iter
    this.original_n = n
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

  clone(): Take<I, Item> {
    return new Take(this.original_iter.clone() as I, this.original_n)
  }

  size_hint(): [number, Option<number>] {
    const [lower, upper] = this.iter.size_hint()
    const clamped_lower = Math.min(this.original_n, lower)
    const clamped_upper = upper.match({
      Some: u => Some(Math.min(this.original_n, u)),
      None: () => Some(this.original_n),
    })
    return [clamped_lower, clamped_upper]
  }
}
