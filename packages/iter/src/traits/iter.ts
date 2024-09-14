import type { Option } from '@starknt/utils'
import { Chain } from '../adapters/chain'
import { Enumerate } from '../adapters/enumerate'
import { Filter } from '../adapters/filter'
import { FilterMap } from '../adapters/filter_map'
import { Take } from '../adapters/take'
import { Map } from '../adapters/map'
import { Zip } from '../adapters/zip'
import { Skip } from '../adapters/skip'
import type { CloneableIterator, IntoIterator } from '../interfaces/iter'
import { Cycle } from '../adapters/cycle'
import { BaseIterator } from './base'
import { Sum } from './sum'

export interface Iterator<Item> {
  next(): Option<Item>
}

export abstract class Iterator<Item> extends BaseIterator<Item> implements CloneableIterator<Item>, IntoIterator<Item> {
  clone(): Iterator<Item> {
    return Object.assign(Object.create(Object.getPrototypeOf(this)), this)
  }

  into_iter(): Iterator<Item> {
    return this
  }

  chain<U extends IntoIterator<Item>>(other: U): Chain<Iterator<Item>, Iterator<Item>, Item> {
    return new Chain(this, other.into_iter())
  }

  zip<ItemB, U extends IntoIterator<ItemB> = Iterator<ItemB>>(other: U): Zip<Item, ItemB> {
    return new Zip<Item, ItemB>(this, other.into_iter())
  }

  filter<P extends (item: Item) => boolean>(predicate: P): Filter<Item> {
    return new Filter<Item>(this, predicate)
  }

  filter_map<F extends (item: Item) => Option<any>, B = ReturnType<F>>(f: F): FilterMap<Item, B> {
    return new FilterMap<Item, B>(this, f)
  }

  map<F extends (item: Item) => any = (item: Item) => any>(f: F): Map<Item> {
    return new Map<Item>(this, f)
  }

  sum(): number {
    return Sum.sum<Item>(this)
  }

  enumerate(): Enumerate<Item> {
    return new Enumerate<Item>(this)
  }

  take(n: number): Take<Item> {
    return new Take<Item>(this, n)
  }

  skip(n: number): Skip<Item> {
    return new Skip<Item>(this, n)
  }

  cycle(): Cycle<Item> {
    return new Cycle<Item>(this)
  }
}
