import { None, Some } from '@starknt/utils'
import { describe, expect, it } from 'vitest'
import { FlatMap } from '../../src/adapters/flat_map'
import { Flatten } from '../../src/adapters/flatten'
import '../../src/globals'

describe('flatMap', () => {
  it('should flat map elements', () => {
    const iter = [1, 2, 3].iter()
    const flatMap = new FlatMap(iter, x => [x, x * 2].iter())

    expect(flatMap.next()).toStrictEqual(Some(1))
    expect(flatMap.next()).toStrictEqual(Some(2))
    expect(flatMap.next()).toStrictEqual(Some(2))
    expect(flatMap.next()).toStrictEqual(Some(4))
    expect(flatMap.next()).toStrictEqual(Some(3))
    expect(flatMap.next()).toStrictEqual(Some(6))
    expect(flatMap.next()).toStrictEqual(None)
  })

  it('should work with empty inner iterators', () => {
    const iter = [1, 2, 3].iter()
    const flatMap = new FlatMap(iter, _ => ([] as number[]).iter())

    expect(flatMap.next()).toStrictEqual(None)
  })

  it('should work with empty outer iterator', () => {
    const iter = ([] as number[]).iter()
    const flatMap = new FlatMap(iter, x => [x, x * 2].iter())

    expect(flatMap.next()).toStrictEqual(None)
  })

  it('should support collect method', () => {
    const iter = [1, 2].iter()
    const flatMap = new FlatMap(iter, x => [x, x * 2].iter())

    expect(flatMap.collect()).toStrictEqual([1, 2, 2, 4])
  })

  it('should work with different inner iterator types', () => {
    const iter = [1, 2].iter()
    const flatMap = new FlatMap(iter, x => [`${x}`, `${x * 2}`].iter())

    expect(flatMap.next()).toStrictEqual(Some('1'))
    expect(flatMap.next()).toStrictEqual(Some('2'))
    expect(flatMap.next()).toStrictEqual(Some('2'))
    expect(flatMap.next()).toStrictEqual(Some('4'))
    expect(flatMap.next()).toStrictEqual(None)
  })
})

describe('flatten', () => {
  it('should flatten nested iterators', () => {
    const nested = [[1, 2].iter(), [3, 4].iter()].iter()
    const flatten = new Flatten(nested)

    expect(flatten.next()).toStrictEqual(Some(1))
    expect(flatten.next()).toStrictEqual(Some(2))
    expect(flatten.next()).toStrictEqual(Some(3))
    expect(flatten.next()).toStrictEqual(Some(4))
    expect(flatten.next()).toStrictEqual(None)
  })

  it('should work with empty inner iterators', () => {
    const nested = [[].iter(), [1, 2].iter()].iter()
    const flatten = new Flatten(nested)

    expect(flatten.next()).toStrictEqual(Some(1))
    expect(flatten.next()).toStrictEqual(Some(2))
    expect(flatten.next()).toStrictEqual(None)
  })

  it('should work with empty outer iterator', () => {
    const nested = ([] as number[]).iter()
    const flatten = new Flatten(nested)

    expect(flatten.next()).toStrictEqual(None)
  })

  it('should support collect method', () => {
    const nested = [[1, 2].iter(), [3, 4].iter()].iter()
    const flatten = new Flatten(nested)

    expect(flatten.collect()).toStrictEqual([1, 2, 3, 4])
  })
})
