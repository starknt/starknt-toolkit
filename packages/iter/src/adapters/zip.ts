import type { Option } from '@starknt/utils'
import { None, Some } from '@starknt/utils'
import type { Iterator } from '../traits/iter'

export class Zip<ItemA, ItemB, A extends Iterator<ItemA> = Iterator<ItemA>, B extends Iterator<ItemB> = Iterator<ItemB>, Item = [ItemA, ItemB]> {
  protected a: A
  protected b: B
  protected index: number

  constructor(a: A, b: B) {
    this.a = a
    this.b = b
    this.index = 0
  }

  next(): Option<Item> {
    const x = this.a.next()
    const y = this.b.next()

    if (x.isNone() || y.isNone())
      return None

    return Some([x.value, y.value]) as Option<Item>
  }

  nth(n: number): Option<Item> {
    let x!: Option<Item>
    while ((x = this.next()) && x.isSome()) {
      if (n === 0)
        return Some(x) as Option<Item>

      n -= 1
    }
    return None
  }

  fold<Acc, F extends (acc: Acc, item: Item) => Acc = (acc: Acc, item: Item) => Acc>(init: Acc, f: F): Acc {
    let acc = init
    let x: Option<Item>
    while ((x = this.next()) && x.isSome())
      acc = f(acc, x.value)
    return acc
  }
}
