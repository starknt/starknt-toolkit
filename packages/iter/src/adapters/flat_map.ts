import type { Option } from '@starknt/utils'
import type { FlattenItem } from './flatten'
import { None } from '@starknt/utils'
import { Iterator } from '../traits/iter'

export class FlatMap<I extends Iterator<any>, F extends (item: Item) => Iterator<any>, Item = FlattenItem<I>, Output = F extends (item: Item) => Iterator<infer Output> ? Output : never> extends Iterator<Output> {
  protected outer: I
  protected f: F
  protected inner: Iterator<Output> | null

  constructor(outer: I, f: F) {
    super()
    this.outer = outer
    this.f = f
    this.inner = null
  }

  next(): Option<Output> {
    while (true) {
      if (this.inner !== null) {
        const item = this.inner.next()
        if (item.isSome())
          return item

        this.inner = null
      }

      const outer_item = this.outer.next()
      if (outer_item.isNone())
        return None

      this.inner = this.f(outer_item.value)
    }
  }

  // try_fold<B, R extends Option<B> = Option<B>, Fold extends (b: B, item: Output) => R = (b: B, item: Output) => R>(init: B, f: Fold): R {
  //   let acc = init
  //   let x: Option<Output>
  //   while ((x = this.next()) && x.isSome()) {
  //     const _acc = f(acc, x.value) as Option<B>
  //     if (_acc.isNone())
  //       return None as R
  //     acc = _acc.value
  //   }

  //   return Some(acc) as R
  // }

  // fold<B, Fold extends (b: B, item: Output) => B = (b: B, item: Output) => B>(init: B, f: Fold): B {
  //   let acc = init
  //   let x: Option<Output>
  //   while ((x = this.next()) && x.isSome())
  //     acc = f(acc, x.value)

  //   return acc
  // }
}
