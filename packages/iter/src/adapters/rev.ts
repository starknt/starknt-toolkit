import type { Option } from '@starknt/utils'
import { DoubleEndedIterator } from '../traits/double_ended_base'

export class Rev<I extends DoubleEndedIterator<Item>, Item = I extends DoubleEndedIterator<infer Item> ? Item : never> extends DoubleEndedIterator<Item> {
  protected iter: I
  private readonly original_iter: I

  constructor(iter: I) {
    super()
    this.iter = iter
    this.original_iter = iter
  }

  next(): Option<Item> {
    return this.iter.next_back()
  }

  next_back(): Option<Item> {
    return this.next()
  }

  // size_hint(): [number, Option<number>] {
  //   return this.iter.size_hint()
  // }

  // advance_by(n: number): Result<undefined, number> {
  //   return this.iter.advance_back_by(n)
  // }

  // nth(n: number): Option<Item> {
  //   return this.iter.nth_back(n)
  // }

  // try_fold<B, R extends Option<B> = Option<B>, F extends (b: B, item: Item) => R = (b: B, item: Item) => R>(init: B, f: F): R {
  //   return this.iter.try_rfold(init, f)
  // }

  // fold<Acc, F extends (acc: Acc, item: Item) => Acc = (acc: Acc, item: Item) => Acc>(init: Acc, f: F): Acc {
  //   return this.iter.rfold(init, f)
  // }

  // find<P extends (item: Item) => boolean>(predicate: P): Option<Item> {
  //   return this.iter.rfind(predicate)
  // }

  // len(): number {
  //   return this.iter.len()
  // }

  // is_empty(): boolean {
  //   return this.iter.is_empty()
  // }

  clone(): Rev<I, Item> {
    return new Rev(this.original_iter.clone() as I)
  }
}
