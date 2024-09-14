import { describe, expect, it } from 'vitest'
import { DoubleEndedIterator, Iterator, once } from '@starknt/iter'
import type { Option } from '@starknt/utils'
import { None, Some } from '@starknt/utils'
import '@starknt/iter/globals'

class Iter extends Iterator<number> {
  private max: number = 10

  constructor() {
    super()
  }

  next(): Option<number> {
    if (this.max > 0) {
      this.max--
      return Some(this.max)
    }

    return None
  }
}

class DoubleIter extends DoubleEndedIterator<number> {
  private max: number = 10

  constructor() {
    super()
  }

  next_back(): Option<number> {
    if (this.max > 0) {
      this.max--
      return Some(this.max)
    }

    return None
  }
}

describe('iter', () => {
  it('once', () => {
    const v = once(1)

    expect(v.next()).toStrictEqual(Some(1))
    expect(v.next()).toStrictEqual(None)
  })

  it('sum', () => {
    const iter = new Iter()

    expect(iter.sum()).toEqual(45)
  })

  it('zip', () => {
    const iter = new Iter()

    expect(iter.zip<number>(new Iter()).fold<number>(0, (a, b) => a + b[0] + b[1])).toEqual(45 + 45)
  })

  it('map', () => {
    const iter = new Iter()

    expect(iter.map(x => x * 2).fold(0 as number, (a, b) => a + b)).eq(90)
  })

  it('filter', () => {
    let iter = new Iter()

    let f = iter.filter(x => x > 5)

    expect(f.count()).eq(Array.from({ length: 9 }, (_, i) => i + 1).filter(x => x > 5).length)
    expect(f.fold(0 as number, (a, b) => a + b)).eq(0)

    iter = new Iter()
    f = iter.filter(x => x < 5)

    expect(f.fold(0 as number, (a, b) => a + b)).eq(1 + 2 + 3 + 4)

    iter = new Iter()
    f = iter.filter(x => x % 2 === 0)

    expect(f.fold(0 as number, (a, b) => a + b)).eq(0 + 2 + 4 + 6 + 8)
  })

  it('filter map', () => {
    const iter = new Iter()

    const fm = iter.filter_map(x => x > 5 ? Some(x * 2) : None)

    expect(fm.next()).toStrictEqual(None)
    expect(fm.next()).toStrictEqual(None)
    expect(fm.next()).toStrictEqual(None)
    expect(fm.next()).toStrictEqual(None)
    expect(fm.next()).toStrictEqual(None)
    expect(fm.next()).toStrictEqual(None)
    expect(fm.next()).toStrictEqual(Some(6 * 2))
    expect(fm.next()).toStrictEqual(Some(7 * 2))
    expect(fm.next()).toStrictEqual(Some(8 * 2))
    expect(fm.next()).toStrictEqual(Some(9 * 2))
    expect(fm.next()).toStrictEqual(Some(None))
    expect(fm.next()).toStrictEqual(Some(None))
  })

  it('last', () => {
    const iter = new Iter()

    expect(iter.last()).toStrictEqual(Some(0))
  })

  it('for of and next', () => {
    const iter = new Iter()
    let x = 10
    for (const v of iter) {
      if (x <= 10)
        expect(v).toStrictEqual(Some(--x))
      else
        expect(v).toStrictEqual(None)
    }

    const iter2 = new Iter()
    let y: Option<number>
    let m = 10
    while ((y = iter2.next()) && y.isSome())
      expect(y).toStrictEqual(Some(--m))
  })

  it('chain', () => {
    const iter = new Iter()

    expect(iter.chain(new Iter()).count()).eq(20)

    const iter2 = new Iter()
    expect(iter2.chain(new Iter()).fold<number>(0, (a, b) => a + b)).eq(45 + 45)
  })

  it('clone', () => {
    const iter = new Iter()

    const iter1 = iter.clone()
    const iter2 = iter.clone()

    expect(iter1.count()).eq(10)
    expect(iter2.count()).eq(10)

    const iter3 = iter.clone()
    const iter4 = iter.clone()

    expect(iter3.chain(iter4).fold<number>(0, (a, b) => a + b)).eq(45 + 45)
  })

  it('array set map', () => {
    const iter = [1].iter()

    expect(iter.next()).toStrictEqual(Some(1))
    expect(iter.next()).toStrictEqual(None)

    const iter1 = new Set([1]).iter()

    expect(iter1.next()).toStrictEqual(Some(1))
    expect(iter1.next()).toStrictEqual(None)

    const iter2 = new Map([[1, 1]]).iter()

    expect(iter2.next()).toStrictEqual(Some(1))
    expect(iter2.next()).toStrictEqual(None)
  })

  it('rev', () => {
    const iter = new DoubleIter()

    expect(iter.rev().next()).toStrictEqual(Some(0))
  })
})
