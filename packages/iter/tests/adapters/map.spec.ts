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
    const iter1 = [1, 2, 3].iter()
    const mapped1 = new Map(iter1, x => x * 2)
    expect(mapped1.count()).toBe(3)

    const iter2 = [1, 2, 3].iter()
    const mapped2 = new Map(iter2, x => x * 2)
    expect(mapped2.collect()).toStrictEqual([2, 4, 6])

    const iter3 = [1, 2, 3].iter()
    const mapped3 = new Map(iter3, x => x * 2)
    expect(mapped3.last()).toStrictEqual(Some(6))
  })

  it('should support find method', () => {
    const iter = [1, 2, 3, 4, 5].iter()
    const mapped = new Map(iter, x => x * 2)

    expect(mapped.find(x => x > 6)).toStrictEqual(Some(8))
  })

  it('should support reduce method', () => {
    const iter = [1, 2, 3, 4].iter()
    const mapped = new Map(iter, x => x * 2)

    expect(mapped.reduce((a, b) => a + b).unwrap()).toStrictEqual(20) // 2 + 4 + 6 + 8
  })

  it('should support clone method', () => {
    const iter = [1, 2, 3, 4, 5].iter()
    const mapped = new Map(iter, x => x * 2)
    let cloned = mapped.clone()

    expect(cloned.next()).toStrictEqual(Some(2))
    expect(cloned.next()).toStrictEqual(Some(4))
    expect(cloned.next()).toStrictEqual(Some(6))
    expect(cloned.next()).toStrictEqual(Some(8))
    expect(cloned.next()).toStrictEqual(Some(10))
    expect(cloned.next()).toStrictEqual(None)

    cloned = mapped.clone()
    expect(cloned.collect()).toStrictEqual([2, 4, 6, 8, 10])
  })
})
