import type { Option } from '@starknt/utils'
import { None } from '@starknt/utils'
import type { Iterator } from './iter'

export class Sum<Item> {
  next(): Option<Item> {
    return None
  }

  static sum<Item, I extends Iterator<Item> = Iterator<Item>>(iter: I): number {
    // @ts-expect-error allow
    return iter.fold<number>(0, (a, b) => a + b)
  }
}
