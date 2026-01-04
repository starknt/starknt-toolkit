import type { Option } from '@starknt/utils'
import { None, Some } from '@starknt/utils'
import { describe, expect, it } from 'vitest'
import { DoubleEndedIterator, Iterator, once } from '../src'
import '../src/globals'

class Iter extends Iterator<number> {
  private max: number = 10

  constructor() {
    super()
  }

  clone(): Iter {
    return new Iter()
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

  clone(): DoubleIter {
    return new DoubleIter()
  }

  next(): Option<number> {
    if (this.max > 0) {
      this.max--
      return Some(this.max)
    }

    return None
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

    expect(iter.zip(new Iter()).fold<number>(0, (a, b) => a + b[0] + b[1])).toEqual(45 + 45)
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

    expect(fm.next()).toStrictEqual(Some(9 * 2))
    expect(fm.next()).toStrictEqual(Some(8 * 2))
    expect(fm.next()).toStrictEqual(Some(7 * 2))
    expect(fm.next()).toStrictEqual(Some(6 * 2))
    expect(fm.next()).toStrictEqual(None)
    expect(fm.next()).toStrictEqual(None)
    expect(fm.next()).toStrictEqual(None)
    expect(fm.next()).toStrictEqual(None)
    expect(fm.next()).toStrictEqual(None)
    expect(fm.next()).toStrictEqual(None)
    expect(fm.next()).toStrictEqual(None)
    expect(fm.next()).toStrictEqual(None)
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

    expect(iter.rev().next()).toStrictEqual(Some(9))
  })

  it('flat_map', () => {
    const iter = new Iter()

    const fm = iter.flat_map<number>(x => [x, x * 2].iter())

    expect(fm.next()).toStrictEqual(Some(9))
    expect(fm.next()).toStrictEqual(Some(18))
    expect(fm.next()).toStrictEqual(Some(8))
    expect(fm.next()).toStrictEqual(Some(16))
  })

  it('flatten', () => {
    const nested = [[1, 2].iter(), [3, 4].iter()].iter()
    const flattened = nested.flatten()

    expect(flattened.next()).toStrictEqual(Some(1))
    expect(flattened.next()).toStrictEqual(Some(2))
    expect(flattened.next()).toStrictEqual(Some(3))
    expect(flattened.next()).toStrictEqual(Some(4))
    expect(flattened.next()).toStrictEqual(None)
  })

  it('step_by', () => {
    const iter = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].iter()

    const stepped = iter.step_by(2)

    expect(stepped.next()).toStrictEqual(Some(1))
    expect(stepped.next()).toStrictEqual(Some(3))
    expect(stepped.next()).toStrictEqual(Some(5))
    expect(stepped.next()).toStrictEqual(Some(7))
    expect(stepped.next()).toStrictEqual(Some(9))
    expect(stepped.next()).toStrictEqual(None)
  })

  it('peekable', () => {
    const iter = [1, 2, 3].iter()
    const peekable = iter.peekable()

    expect(peekable.peek()).toStrictEqual(Some(1))
    expect(peekable.peek()).toStrictEqual(Some(1))
    expect(peekable.next()).toStrictEqual(Some(1))
    expect(peekable.peek()).toStrictEqual(Some(2))
    expect(peekable.next()).toStrictEqual(Some(2))
    expect(peekable.peek()).toStrictEqual(Some(3))
    expect(peekable.next()).toStrictEqual(Some(3))
    expect(peekable.peek()).toStrictEqual(None)
    expect(peekable.next()).toStrictEqual(None)
  })

  it('scan', () => {
    const iter = [1, 2, 3].iter()
    const scanned = iter.scan(0, (acc, x) => acc + x)
    expect(scanned.next()).toStrictEqual(Some(1))
    expect(scanned.next()).toStrictEqual(Some(3))
    expect(scanned.next()).toStrictEqual(Some(6))
    expect(scanned.next()).toStrictEqual(None)
  })

  it('inspect', () => {
    const iter = [1, 2, 3].iter()
    let count = 0
    const inspected = iter.inspect(x => count += x)
    expect(inspected.next()).toStrictEqual(Some(1))
    expect(count).toBe(1)
    expect(inspected.next()).toStrictEqual(Some(2))
    expect(count).toBe(3)
    expect(inspected.next()).toStrictEqual(Some(3))
    expect(count).toBe(6)
    expect(inspected.next()).toStrictEqual(None)
  })

  it('map_while', () => {
    const iter = [1, 2, 3, 4, 5].iter()
    const mapped = iter.map_while(x => x < 4 ? Some(x * 2) : None)
    expect(mapped.next()).toStrictEqual(Some(2))
    expect(mapped.next()).toStrictEqual(Some(4))
    expect(mapped.next()).toStrictEqual(Some(6))
    expect(mapped.next()).toStrictEqual(None)
    // Should stop after first None, so 4 and 5 are not processed
  })

  it('intersperse', () => {
    const iter = [1, 2, 3].iter()
    const interspersed = iter.intersperse(0)
    expect(interspersed.next()).toStrictEqual(Some(1))
    expect(interspersed.next()).toStrictEqual(Some(0))
    expect(interspersed.next()).toStrictEqual(Some(2))
    expect(interspersed.next()).toStrictEqual(Some(0))
    expect(interspersed.next()).toStrictEqual(Some(3))
    expect(interspersed.next()).toStrictEqual(None)
  })

  it('intersperse_with', () => {
    const iter = [1, 2, 3].iter()
    let counter = 0
    const interspersed = iter.intersperse_with(() => {
      counter++
      return counter * 10
    })
    expect(interspersed.next()).toStrictEqual(Some(1))
    expect(interspersed.next()).toStrictEqual(Some(10))
    expect(interspersed.next()).toStrictEqual(Some(2))
    expect(interspersed.next()).toStrictEqual(Some(20))
    expect(interspersed.next()).toStrictEqual(Some(3))
    expect(interspersed.next()).toStrictEqual(None)
  })
})
