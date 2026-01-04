import type { Option } from '@starknt/utils'
import type { Iterator } from '../src'
import type { Chain } from '../src/adapters/chain'
import { None, Some } from '@starknt/utils'
import { expectTypeOf, it } from 'vitest'
import '../src/globals'

it('map: number to number', () => {
  const iter = [1, 2, 3].iter()
  const mapped = iter.map(x => x * 2)

  expectTypeOf(mapped.next()).toMatchTypeOf<Option<number>>()
})

it('map: number to string', () => {
  const iter = [1, 2, 3].iter()
  const mapped = iter.map(x => x.toString())

  expectTypeOf(mapped.next()).toMatchTypeOf<Option<string>>()
})

it('map: union types', () => {
  const iter: Iterator<number | string> = [1, 'a', 2, 'b'].iter()
  const mapped = iter.map(x => typeof x)

  expectTypeOf(mapped.next()).toMatchTypeOf<Option<string>>()
})

it('filter_map: number', () => {
  const iter = [1, 2, 3, 4, 5].iter()
  const filtered = iter.filter_map(x => x > 3 ? Some(x * 2) : None)

  expectTypeOf(filtered.next).returns.toEqualTypeOf<Option<number>>()
})

it('filter_map: union types', () => {
  const iter: Iterator<number | string> = [1, 'a', 2, 'b'].iter()
  const filtered = iter.filter_map(x => typeof x === 'string' ? Some(x.toUpperCase()) : None)

  expectTypeOf(filtered.next()).toMatchTypeOf<Option<string>>()
})

it('flat_map: number', () => {
  const iter = [1, 2, 3].iter()
  const flatMapped = iter.flat_map<number>(x => [x, x * 2].iter())

  expectTypeOf(flatMapped.next()).toMatchTypeOf<Option<number>>()
})

it('enumerate', () => {
  const iter = [1, 2, 3].iter()
  const enumerated = iter.enumerate()

  expectTypeOf(enumerated.next()).toMatchTypeOf<Option<[number, number]>>()
})

it('chain', () => {
  const iter1 = [1, 2].iter()
  const iter2 = [3, 4].iter()
  const chained = iter1.chain(iter2)

  // Only test type, don't call next() to avoid runtime error
  expectTypeOf(chained).toMatchTypeOf<Chain<number>>()
})

it('zip', () => {
  const iter1 = [1, 2, 3].iter()
  const iter2 = ['a', 'b', 'c'].iter()
  const zipped = iter1.zip(iter2)

  expectTypeOf(zipped.next()).toMatchTypeOf<Option<[number, string]>>()
})

it('scan', () => {
  const iter = [1, 2, 3].iter()
  const scanned = iter.scan(0, (acc, x) => acc + x)

  expectTypeOf(scanned.next()).toMatchTypeOf<Option<number>>()
})

it('inspect', () => {
  const iter = [1, 2, 3].iter()
  const inspected = iter.inspect(x => void x)

  expectTypeOf(inspected.next()).toMatchTypeOf<Option<number>>()
})

it('map_while', () => {
  const iter = [1, 2, 3].iter()
  const mapped = iter.map_while(x => x < 3 ? Some(x * 2) : None)

  expectTypeOf(mapped.next()).toMatchTypeOf<Option<number>>()
})

it('intersperse', () => {
  const iter = [1, 2, 3].iter()
  const interspersed = iter.intersperse(0)

  expectTypeOf(interspersed.next()).toMatchTypeOf<Option<number>>()
})

it('intersperse_with', () => {
  const iter = [1, 2, 3].iter()
  const interspersed = iter.intersperse_with(() => 0)

  expectTypeOf(interspersed.next()).toMatchTypeOf<Option<number>>()
})
