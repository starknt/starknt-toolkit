import type { Option } from '@starknt/utils'
import { None, Some } from '@starknt/utils'
import { Iterator } from '../traits/base'

export class Enumerate<Item, I extends Iterator<Item> = Iterator<Item>, Output = [number, Item]> extends Iterator<Output> {
  protected iter: I
  private _count: number

  constructor(iter: I) {
    super()
    this.iter = iter
    this._count = 0
  }

  next(): Option<Output> {
    const a = this.iter.next()
    if (a.isNone())
      return None
    const i = this._count
    this._count += 1
    return Some([i, a.value]) as Option<Output>
  }

  nth(n: number): Option<Output> {
    const a = this.iter.nth(n)
    if (a.isNone())
      return None
    const i = this._count + n
    this._count = i + 1
    return Some([i, a.value]) as Option<Output>
  }

  count(): number {
    return this.iter.count()
  }
}
