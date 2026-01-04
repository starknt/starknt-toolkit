import type { Option } from '@starknt/utils'
import { None, Some } from '@starknt/utils'
import { Iterator } from '../traits/base'

export class Zip<const ItemA, const ItemB> extends Iterator<[ItemA, ItemB]> {
  protected a: Iterator<ItemA>
  protected b: Iterator<ItemB>
  protected index: number
  private original_a: Iterator<ItemA>
  private original_b: Iterator<ItemB>

  constructor(a: Iterator<ItemA>, b: Iterator<ItemB>) {
    super()
    this.a = a
    this.b = b
    this.original_a = a
    this.original_b = b
    this.index = 0
  }

  next(): Option<[ItemA, ItemB]> {
    const x = this.a.next()
    const y = this.b.next()

    if (x.isNone() || y.isNone())
      return None

    return Some([x.value, y.value] as [ItemA, ItemB])
  }

  nth(n: number): Option<[ItemA, ItemB]> {
    let x!: Option<[ItemA, ItemB]>
    while ((x = this.next()) && x.isSome()) {
      if (n === 0)
        return x

      n -= 1
    }
    return None
  }

  clone(): Zip<ItemA, ItemB> {
    // Clone the original iterators (Rust-like behavior)
    return new Zip(this.original_a.clone(), this.original_b.clone())
  }

  size_hint(): [number, Option<number>] {
    const [lower_a, upper_a] = this.original_a.size_hint()
    const [lower_b, upper_b] = this.original_b.size_hint()

    // Zip stops at the shorter iterator
    const combined_lower = Math.min(lower_a, lower_b)

    const combined_upper = upper_a.match({
      Some: u_a => upper_b.match({
        Some: u_b => Some(Math.min(u_a, u_b)),
        None: () => Some(u_a),
      }),
      None: () => upper_b,
    })

    return [combined_lower, combined_upper]
  }
}
