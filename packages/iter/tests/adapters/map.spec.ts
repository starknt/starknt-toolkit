import { None, Some } from '@starknt/utils'
import { describe, expect, it } from 'vitest'
import { Map } from '../../src/adapters/map'
import '../../src/globals'

describe('map', () => {
  it('should map elements using a function', () => {
    const iter = [1, 2, 3, 4, 5].iter()
    const mapped = new Map(iter, x => x * 2)

    expect(mapped.next()).toStrictEqual(Some(2))
    expect(mapped.next()).toStrictEqual(Some(4))
    expect(mapped.next()).toStrictEqual(Some(6))
    expect(mapped.next()).toStrictEqual(Some(8))
    expect(mapped.next()).toStrictEqual(Some(10))
    expect(mapped.next()).toStrictEqual(None)
  })

  it('should work with type transformations', () => {
    const iter = [1, 2, 3].iter()
    const mapped = new Map(iter, x => x.toString())

    expect(mapped.next()).toStrictEqual(Some('1'))
    expect(mapped.next()).toStrictEqual(Some('2'))
    expect(mapped.next()).toStrictEqual(Some('3'))
    expect(mapped.next()).toStrictEqual(None)
  })

  it('should work with empty iterator', () => {
    const iter = [].iter()
    const mapped = new Map(iter, x => x * 2)

    expect(mapped.next()).toStrictEqual(None)
  })

  it('should support all standard iterator methods', () => {
    const iter = [1, 2, 3].iter()
    const mapped = new Map(iter, x => x * 2)

    expect(mapped.count()).toBe(3)
    expect(mapped.collect()).toStrictEqual([2, 4, 6])
    expect(mapped.last()).toStrictEqual(Some(6))
  })

  it('should support find method', () => {
    const iter = [1, 2, 3, 4, 5].iter()
    const mapped = new Map(iter, x => x * 2)

    expect(mapped.find(x => x > 6)).toStrictEqual(Some(8))
  })

  it('should support reduce method', () => {
    const iter = [1, 2, 3, 4].iter()
    const mapped = new Map(iter, x => x * 2)

    expect(mapped.reduce((a, b) => a + b)).toStrictEqual(Some(20)) // 2 + 4 + 6 + 8
  })
})
