import { None, Some } from '@starknt/utils'
import { describe, expect, it } from 'vitest'
import { SkipWhile } from '../../src/adapters/skip_while'
import { TakeWhile } from '../../src/adapters/take_while'
import '../../src/globals'

describe('takeWhile', () => {
  it('should take elements while predicate is true', () => {
    const iter = [1, 2, 3, 4, 5].iter()
    const takeWhile = new TakeWhile(iter, x => x < 4)

    expect(takeWhile.next()).toStrictEqual(Some(1))
    expect(takeWhile.next()).toStrictEqual(Some(2))
    expect(takeWhile.next()).toStrictEqual(Some(3))
    expect(takeWhile.next()).toStrictEqual(None)
  })

  it('should stop at first false predicate', () => {
    const iter = [2, 4, 6, 7, 8].iter()
    const takeWhile = new TakeWhile(iter, x => x % 2 === 0)

    expect(takeWhile.next()).toStrictEqual(Some(2))
    expect(takeWhile.next()).toStrictEqual(Some(4))
    expect(takeWhile.next()).toStrictEqual(Some(6))
    expect(takeWhile.next()).toStrictEqual(None) // stops at 7
  })

  it('should work when predicate is always false', () => {
    const iter = [1, 2, 3].iter()
    const takeWhile = new TakeWhile(iter, x => x > 10)

    expect(takeWhile.next()).toStrictEqual(None)
  })

  it('should work when predicate is always true', () => {
    const iter = [1, 2, 3].iter()
    const takeWhile = new TakeWhile(iter, x => x < 10)

    expect(takeWhile.next()).toStrictEqual(Some(1))
    expect(takeWhile.next()).toStrictEqual(Some(2))
    expect(takeWhile.next()).toStrictEqual(Some(3))
    expect(takeWhile.next()).toStrictEqual(None)
  })

  it('should work with empty iterator', () => {
    const iter = [].iter()
    const takeWhile = new TakeWhile(iter, x => x > 0)

    expect(takeWhile.next()).toStrictEqual(None)
  })

  it('should support collect method', () => {
    const iter = [1, 2, 3, 4, 5].iter()
    const takeWhile = new TakeWhile(iter, x => x < 4)

    expect(takeWhile.collect()).toStrictEqual([1, 2, 3])
  })
})

describe('skipWhile', () => {
  it('should skip elements while predicate is true', () => {
    const iter = [1, 2, 3, 4, 5].iter()
    const skipWhile = new SkipWhile(iter, x => x < 3)

    expect(skipWhile.next()).toStrictEqual(Some(3))
    expect(skipWhile.next()).toStrictEqual(Some(4))
    expect(skipWhile.next()).toStrictEqual(Some(5))
    expect(skipWhile.next()).toStrictEqual(None)
  })

  it('should start at first false predicate', () => {
    const iter = [2, 4, 6, 7, 8].iter()
    const skipWhile = new SkipWhile(iter, x => x % 2 === 0)

    expect(skipWhile.next()).toStrictEqual(Some(7))
    expect(skipWhile.next()).toStrictEqual(Some(8))
    expect(skipWhile.next()).toStrictEqual(None)
  })

  it('should work when predicate is always true', () => {
    const iter = [1, 2, 3].iter()
    const skipWhile = new SkipWhile(iter, x => x < 10)

    expect(skipWhile.next()).toStrictEqual(None)
  })

  it('should work when predicate is always false', () => {
    const iter = [1, 2, 3].iter()
    const skipWhile = new SkipWhile(iter, x => x > 10)

    expect(skipWhile.next()).toStrictEqual(Some(1))
    expect(skipWhile.next()).toStrictEqual(Some(2))
    expect(skipWhile.next()).toStrictEqual(Some(3))
    expect(skipWhile.next()).toStrictEqual(None)
  })

  it('should work with empty iterator', () => {
    const iter = [].iter()
    const skipWhile = new SkipWhile(iter, x => x > 0)

    expect(skipWhile.next()).toStrictEqual(None)
  })

  it('should support collect method', () => {
    const iter = [1, 2, 3, 4, 5].iter()
    const skipWhile = new SkipWhile(iter, x => x < 3)

    expect(skipWhile.collect()).toStrictEqual([3, 4, 5])
  })
})
