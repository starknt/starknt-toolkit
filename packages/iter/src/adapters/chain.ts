import type { Option } from '@starknt/utils'
import { None, Some } from '@starknt/utils'
import { Iterator } from '../traits/base'

function and_then_or_clear<T, U>(opt: Option<T>, f: (item: T) => Option<U>): Option<U> {
  if (opt.isNone())
    return opt
  const x = f(opt.value)
  if (x.isNone())
    opt = None

  return x
}

export class Chain<const Item> extends Iterator<Item> {
  protected a: Option<Iterator<Item>>
  protected b: Option<Iterator<Item>>
  private readonly original_a: Iterator<Item>
  private readonly original_b: Iterator<Item>

  constructor(a: Iterator<Item>, b: Iterator<Item>) {
    super()
    this.a = Some(a)
    this.b = Some(b)
    this.original_a = a
    this.original_b = b
  }

  next(): Option<Item> {
    if (this.a.isNone())
      return None

    return and_then_or_clear(
      this.a,
      (a: Iterator<Item>) => a.next(),
    ).orElse(() => this.b.isSome() ? this.b.value.next() : None)
  }

  count(): number {
    const a_count = this.a.match({
      Some: a => a.count(),
      None: () => 0,
    })
    const b_count = this.b.match({
      Some: b => b.count(),
      None: () => 0,
    })

    return a_count + b_count
  }

  last(): Option<Item> {
    const a_last = this.a.andThen(a => a.last())
    const b_last = this.b.andThen(b => b.last())
    return b_last.or(a_last)
  }

  clone(): Chain<Item> {
    // Clone the original iterators (Rust-like behavior)
    return new Chain(this.original_a.clone(), this.original_b.clone())
  }

  size_hint(): [number, Option<number>] {
    const [lower_a, upper_a] = this.original_a.size_hint()
    const [lower_b, upper_b] = this.original_b.size_hint()

    const combined_lower = lower_a + lower_b

    const combined_upper = upper_a.match({
      Some: u_a => upper_b.match({
        Some: u_b => Some(u_a + u_b),
        None: () => None,
      }),
      None: () => None,
    })

    return [combined_lower, combined_upper]
  }
}
