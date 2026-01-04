import type { Option } from '@starknt/utils'
import { None, Some } from '@starknt/utils'
import { Iterator } from './traits/iter'

export class Item<T> extends Iterator<T> {
  protected opt!: Option<T>
  protected t = false
  private originalOpt: Option<T>

  constructor(opt: Option<T>) {
    super()
    this.opt = opt
    this.originalOpt = opt
  }

  clone(): Item<T> {
    return new Item(this.originalOpt)
  }

  private _take(): Option<T> {
    const r: Option<T> = this.opt
    if (!this.t) {
      this.t = true
      this.opt = None
    }

    return r
  }

  next(): Option<T> {
    return this._take()
  }

  size_hint(): [number, Option<number>] {
    return this.opt.match<[number, Option<number>]>({
      Some: () => [1, Some(1)],
      None: () => [0, Some(0)],
    })
  }

  next_back(): Option<T> {
    return this._take()
  }
}

export class IntoIter<A> {
  protected inner!: Item<A>

  constructor(a: Item<A>) {
    this.inner = a
  }

  next(): Option<A> {
    return this.inner.next()
  }

  size_hint(): [number, Option<number>] {
    return this.inner.size_hint()
  }

  next_back(): Option<A> {
    return this.inner.next_back()
  }
}

export function into_iter<T>(v: Option<T>): IntoIter<T> {
  return new IntoIter<T>(new Item<T>(v))
}
