import { None, Some } from '@starknt/utils'
import { describe, expect, it } from 'vitest'
import { Skip } from '../../src/adapters/skip'
import { Take } from '../../src/adapters/take'
import { testClone } from './clone.test-helper'
import '../../src/globals'

describe('take', () => {
  it('should take n elements', () => {
    const iter = [1, 2, 3, 4, 5].iter()
    const take = new Take(iter, 3)

    expect(take.next()).toStrictEqual(Some(1))
    expect(take.next()).toStrictEqual(Some(2))
    expect(take.next()).toStrictEqual(Some(3))
    expect(take.next()).toStrictEqual(None)
  })

  it('should work when n is greater than iterator length', () => {
    const iter = [1, 2, 3].iter()
    const take = new Take(iter, 5)

    expect(take.next()).toStrictEqual(Some(1))
    expect(take.next()).toStrictEqual(Some(2))
    expect(take.next()).toStrictEqual(Some(3))
    expect(take.next()).toStrictEqual(None)
  })

  it('should work with n = 0', () => {
    const iter = [1, 2, 3].iter()
    const take = new Take(iter, 0)

    expect(take.next()).toStrictEqual(None)
  })

  it('should work with empty iterator', () => {
    const iter = [].iter()
    const take = new Take(iter, 3)

    expect(take.next()).toStrictEqual(None)
  })

  it('should support collect method', () => {
    const iter = [1, 2, 3, 4, 5].iter()
    const take = new Take(iter, 3)

    expect(take.collect()).toStrictEqual([1, 2, 3])
  })

  it('should support count method', () => {
    const iter = [1, 2, 3, 4, 5].iter()
    const take = new Take(iter, 3)

    expect(take.count()).toBe(3)
  })
})

describe('skip', () => {
  it('should skip n elements', () => {
    const iter = [1, 2, 3, 4, 5].iter()
    const skip = new Skip(iter, 2)

    expect(skip.next()).toStrictEqual(Some(3))
    expect(skip.next()).toStrictEqual(Some(4))
    expect(skip.next()).toStrictEqual(Some(5))
    expect(skip.next()).toStrictEqual(None)
  })

  it('should work when n is greater than iterator length', () => {
    const iter = [1, 2, 3].iter()
    const skip = new Skip(iter, 5)

    expect(skip.next()).toStrictEqual(None)
  })

  it('should work with n = 0', () => {
    const iter = [1, 2, 3].iter()
    const skip = new Skip(iter, 0)

    expect(skip.next()).toStrictEqual(Some(1))
    expect(skip.next()).toStrictEqual(Some(2))
    expect(skip.next()).toStrictEqual(Some(3))
    expect(skip.next()).toStrictEqual(None)
  })

  it('should work with empty iterator', () => {
    const iter = [].iter()
    const skip = new Skip(iter, 3)

    expect(skip.next()).toStrictEqual(None)
  })

  it('should support collect method', () => {
    const iter = [1, 2, 3, 4, 5].iter()
    const skip = new Skip(iter, 2)

    expect(skip.collect()).toStrictEqual([3, 4, 5])
  })

  it('should support count method', () => {
    const iter = [1, 2, 3, 4, 5].iter()
    const skip = new Skip(iter, 2)

    expect(skip.count()).toBe(3)
  })

  it('should support clone method', () => {
    testClone(
      () => new Skip([1, 2, 3, 4, 5].iter(), 2),
      [3, 4, 5],
    )
  })
})
