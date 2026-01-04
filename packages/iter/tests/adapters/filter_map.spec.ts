import type { Option } from '@starknt/utils'
import { None, Some } from '@starknt/utils'
import { describe, expect, it } from 'vitest'
import { FilterMap } from '../../src/adapters/filter_map'
import '../../src/globals'

describe('filterMap', () => {
  it('should filter and map elements', () => {
    const iter = [1, 2, 3, 4, 5].iter()
    const filterMap = new FilterMap(iter, x => x % 2 === 0 ? Some(x * 2) : None)

    expect(filterMap.next()).toStrictEqual(Some(4))
    expect(filterMap.next()).toStrictEqual(Some(8))
    expect(filterMap.next()).toStrictEqual(None)
  })

  it('should return None for filtered elements', () => {
    const iter = [1, 3, 5].iter()
    const filterMap = new FilterMap(iter, x => x % 2 === 0 ? Some(x * 2) : None)

    expect(filterMap.next()).toStrictEqual(None)
  })

  it('should work with empty iterator', () => {
    const iter = [].iter()
    const filterMap = new FilterMap(iter, x => Some(x * 2))

    expect(filterMap.next()).toStrictEqual(None)
  })

  it('should work with type transformations', () => {
    const iter = [1, 2, 3, 4, 5].iter()
    const filterMap = new FilterMap(iter, x => x > 2 ? Some(x.toString()) : None)

    expect(filterMap.next()).toStrictEqual(Some('3'))
    expect(filterMap.next()).toStrictEqual(Some('4'))
    expect(filterMap.next()).toStrictEqual(Some('5'))
    expect(filterMap.next()).toStrictEqual(None)
  })

  it('should support all standard iterator methods', () => {
    const iter1 = [1, 2, 3, 4, 5].iter()
    const filterMap1 = new FilterMap(iter1, x => x % 2 === 0 ? Some(x * 2) : None)
    expect(filterMap1.count()).toBe(2)

    const iter2 = [1, 2, 3, 4, 5].iter()
    const filterMap2 = new FilterMap(iter2, x => x % 2 === 0 ? Some(x * 2) : None)
    expect(filterMap2.collect()).toStrictEqual([4, 8])
  })

  it('should support find_map method', () => {
    const iter = [1, 2, 3, 4, 5].iter()
    const filterMap = new FilterMap(iter, x => (x % 2 === 0 ? Some(x * 2) : None) as Option<number>)

    expect(filterMap.find_map(x => x > 6 ? Some(x) : None)).toStrictEqual(Some(8))
  })

  it('should support clone method', () => {
    const iter = [1, 2, 3, 4, 5].iter()
    const filterMap = new FilterMap(iter, x => (x % 2 === 0 ? Some(x * 2) : None) as Option<number>)
    let cloned = filterMap.clone()

    expect(cloned.next()).toStrictEqual(Some(4))
    expect(cloned.next()).toStrictEqual(Some(8))
    expect(cloned.next()).toStrictEqual(None)

    cloned = filterMap.clone()
    expect(cloned.collect()).toStrictEqual([4, 8])
  })
})
