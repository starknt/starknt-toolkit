import { None, Some } from '@starknt/utils'
import { describe, expect, it } from 'vitest'
import { Zip } from '../../src/adapters/zip'
import '../../src/globals'

describe('zip', () => {
  it('should zip two iterators', () => {
    const iter1 = [1, 2, 3].iter()
    const iter2 = ['a', 'b', 'c'].iter()
    const zip = new Zip(iter1, iter2)

    expect(zip.next()).toStrictEqual(Some([1, 'a']))
    expect(zip.next()).toStrictEqual(Some([2, 'b']))
    expect(zip.next()).toStrictEqual(Some([3, 'c']))
    expect(zip.next()).toStrictEqual(None)
  })

  it('should stop when first iterator is exhausted', () => {
    const iter1 = [1, 2].iter()
    const iter2 = ['a', 'b', 'c', 'd'].iter()
    const zip = new Zip(iter1, iter2)

    expect(zip.next()).toStrictEqual(Some([1, 'a']))
    expect(zip.next()).toStrictEqual(Some([2, 'b']))
    expect(zip.next()).toStrictEqual(None)
  })

  it('should stop when second iterator is exhausted', () => {
    const iter1 = [1, 2, 3, 4].iter()
    const iter2 = ['a', 'b'].iter()
    const zip = new Zip(iter1, iter2)

    expect(zip.next()).toStrictEqual(Some([1, 'a']))
    expect(zip.next()).toStrictEqual(Some([2, 'b']))
    expect(zip.next()).toStrictEqual(None)
  })

  it('should work with empty iterators', () => {
    const iter1 = [].iter()
    const iter2 = [1, 2, 3].iter()
    const zip = new Zip(iter1, iter2)

    expect(zip.next()).toStrictEqual(None)
  })

  it('should support nth method with custom implementation', () => {
    const iter1 = [1, 2, 3, 4, 5].iter()
    const iter2 = ['a', 'b', 'c', 'd', 'e'].iter()
    const zip = new Zip(iter1, iter2)

    expect(zip.nth(2)).toStrictEqual(Some([3, 'c']))
  })

  it('should support collect method', () => {
    const iter1 = [1, 2].iter()
    const iter2 = ['a', 'b'].iter()
    const zip = new Zip(iter1, iter2)

    expect(zip.collect()).toStrictEqual([[1, 'a'], [2, 'b']])
  })

  it('should support count method', () => {
    const iter1 = [1, 2, 3].iter()
    const iter2 = ['a', 'b', 'c'].iter()
    const zip = new Zip(iter1, iter2)

    expect(zip.count()).toBe(3)
  })

  it('should support clone method', () => {
    const iter1 = [1, 2, 3].iter()
    const iter2 = ['a', 'b', 'c'].iter()
    const zip = new Zip(iter1, iter2)
    let cloned = zip.clone()

    expect(cloned.next()).toStrictEqual(Some([1, 'a']))
    expect(cloned.next()).toStrictEqual(Some([2, 'b']))
    expect(cloned.next()).toStrictEqual(Some([3, 'c']))
    expect(cloned.next()).toStrictEqual(None)

    cloned = zip.clone()
    expect(cloned.collect()).toStrictEqual([[1, 'a'], [2, 'b'], [3, 'c']])
  })
})
