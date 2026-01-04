import { None, Some } from '@starknt/utils'
import { describe, expect, it } from 'vitest'
import { Filter } from '../../src/adapters/filter'
import '../../src/globals'

describe('filter', () => {
  it('should filter elements based on predicate', () => {
    const iter = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].iter()
    const filter = new Filter(iter, x => x % 2 === 0)

    expect(filter.next()).toStrictEqual(Some(2))
    expect(filter.next()).toStrictEqual(Some(4))
    expect(filter.next()).toStrictEqual(Some(6))
    expect(filter.next()).toStrictEqual(Some(8))
    expect(filter.next()).toStrictEqual(Some(10))
    expect(filter.next()).toStrictEqual(None)
  })

  it('should return None when no elements match', () => {
    const iter = [1, 3, 5].iter()
    const filter = new Filter(iter, x => x > 10)

    expect(filter.next()).toStrictEqual(None)
  })

  it('should work with empty iterator', () => {
    const iter = [].iter()
    const filter = new Filter(iter, x => x > 0)

    expect(filter.next()).toStrictEqual(None)
  })

  it('should work with string predicates', () => {
    const iter = ['apple', 'banana', 'cherry', 'date'].iter()
    const filter = new Filter(iter, s => s.length > 5)

    expect(filter.next()).toStrictEqual(Some('banana'))
    expect(filter.next()).toStrictEqual(Some('cherry'))
    expect(filter.next()).toStrictEqual(None)
  })

  it('should support count method', () => {
    const iter = [1, 2, 3, 4, 5].iter()
    const filter = new Filter(iter, x => x % 2 === 0)

    expect(filter.count()).toBe(2)
  })

  it('should support collect method', () => {
    const iter = [1, 2, 3, 4, 5].iter()
    const filter = new Filter(iter, x => x % 2 === 0)

    expect(filter.collect()).toStrictEqual([2, 4])
  })

  it('should support find method', () => {
    const iter = [1, 2, 3, 4, 5].iter()
    const filter = new Filter(iter, x => x % 2 === 0)

    expect(filter.find(x => x > 3)).toStrictEqual(Some(4))
  })

  it('should support find method returning None', () => {
    const iter = [1, 2, 3, 4, 5].iter()
    const filter = new Filter(iter, x => x % 2 === 0)

    expect(filter.find(x => x > 10)).toStrictEqual(None)
  })

  it('should support any and all methods', () => {
    const iter1 = [1, 2, 3, 4, 5, 6, 7, 8].iter()
    const filter1 = new Filter(iter1, x => x % 2 === 0)
    expect(filter1.any(x => x > 5)).toBe(true)

    const iter2 = [1, 2, 3, 4, 5, 6, 7, 8].iter()
    const filter2 = new Filter(iter2, x => x % 2 === 0)
    expect(filter2.all(x => x > 10)).toBe(false)
  })

  it('should support clone method', () => {
    const iter = [1, 2, 3, 4, 5, 6, 7, 8].iter()
    const filter = new Filter(iter, x => x % 2 === 0)
    let cloned = filter.clone()

    expect(cloned.next()).toStrictEqual(Some(2))
    expect(cloned.next()).toStrictEqual(Some(4))
    expect(cloned.next()).toStrictEqual(Some(6))
    expect(cloned.next()).toStrictEqual(Some(8))
    expect(cloned.next()).toStrictEqual(None)

    cloned = filter.clone()
    expect(cloned.collect()).toStrictEqual([2, 4, 6, 8])
  })
})
