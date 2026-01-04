import { None, Some } from '@starknt/utils'
import { describe, expect, it } from 'vitest'
import { Chain } from '../../src/adapters/chain'
import '../../src/globals'

describe('chain', () => {
  it('should chain two iterators', () => {
    const iter1 = [1, 2, 3].iter()
    const iter2 = [4, 5, 6].iter()
    const chain = new Chain(iter1, iter2)

    expect(chain.next()).toStrictEqual(Some(1))
    expect(chain.next()).toStrictEqual(Some(2))
    expect(chain.next()).toStrictEqual(Some(3))
    expect(chain.next()).toStrictEqual(Some(4))
    expect(chain.next()).toStrictEqual(Some(5))
    expect(chain.next()).toStrictEqual(Some(6))
    expect(chain.next()).toStrictEqual(None)
  })

  it('should work with empty first iterator', () => {
    const iter1 = ([] as number[]).iter()
    const iter2 = [1, 2, 3].iter()
    const chain = new Chain(iter1, iter2)

    expect(chain.next()).toStrictEqual(Some(1))
    expect(chain.next()).toStrictEqual(Some(2))
    expect(chain.next()).toStrictEqual(Some(3))
    expect(chain.next()).toStrictEqual(None)
  })

  it('should work with empty second iterator', () => {
    const iter1 = [1, 2, 3].iter()
    const iter2 = ([] as number[]).iter()
    const chain = new Chain(iter1, iter2)

    expect(chain.next()).toStrictEqual(Some(1))
    expect(chain.next()).toStrictEqual(Some(2))
    expect(chain.next()).toStrictEqual(Some(3))
    expect(chain.next()).toStrictEqual(None)
  })

  it('should work with both empty iterators', () => {
    const iter1 = [].iter()
    const iter2 = [].iter()
    const chain = new Chain(iter1, iter2)

    expect(chain.next()).toStrictEqual(None)
  })

  it('should support count method with custom implementation', () => {
    const iter1 = [1, 2, 3].iter()
    const iter2 = [4, 5].iter()
    const chain = new Chain(iter1, iter2)

    expect(chain.count()).toBe(5)
  })

  it('should support last method with custom implementation', () => {
    const iter1 = [1, 2, 3].iter()
    const iter2 = [4, 5].iter()
    const chain = new Chain(iter1, iter2)

    expect(chain.last()).toStrictEqual(Some(5))
  })

  it('should support collect method', () => {
    const iter1 = [1, 2].iter()
    const iter2 = [3, 4].iter()
    const chain = new Chain(iter1, iter2)

    expect(chain.collect()).toStrictEqual([1, 2, 3, 4])
  })
})
