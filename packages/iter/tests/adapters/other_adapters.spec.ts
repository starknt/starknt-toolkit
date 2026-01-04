import { None, Some } from '@starknt/utils'
import { describe, expect, it } from 'vitest'
import { Cycle } from '../../src/adapters/cycle'
import { Enumerate } from '../../src/adapters/enumerate'
import { Fuse } from '../../src/adapters/fuse'
import { Inspect } from '../../src/adapters/inspect'
import { Intersperse } from '../../src/adapters/intersperse'
import { IntersperseWith } from '../../src/adapters/intersperse_with'
import { MapWhile } from '../../src/adapters/map_while'
import { Peekable } from '../../src/adapters/peekable'
import { Rev } from '../../src/adapters/rev'
import { Scan } from '../../src/adapters/scan'
import { StepBy } from '../../src/adapters/step_by'
import { DoubleEndedIterator } from '../../src/traits/double_ended'
import '../../src/globals'

describe('cycle', () => {
  it('should cycle through elements', () => {
    const iter = [1, 2, 3].iter()
    const cycle = new Cycle(iter)

    expect(cycle.next()).toStrictEqual(Some(1))
    expect(cycle.next()).toStrictEqual(Some(2))
    expect(cycle.next()).toStrictEqual(Some(3))
    expect(cycle.next()).toStrictEqual(Some(1))
    expect(cycle.next()).toStrictEqual(Some(2))
    expect(cycle.next()).toStrictEqual(Some(3))
    expect(cycle.next()).toStrictEqual(Some(1))
  })

  it('should work with empty iterator', () => {
    const iter = [].iter()
    const cycle = new Cycle(iter)

    expect(cycle.next()).toStrictEqual(None)
  })
})

describe('enumerate', () => {
  it('should enumerate elements with indices', () => {
    const iter = ['a', 'b', 'c'].iter()
    const enumerate = new Enumerate(iter)

    expect(enumerate.next()).toStrictEqual(Some([0, 'a']))
    expect(enumerate.next()).toStrictEqual(Some([1, 'b']))
    expect(enumerate.next()).toStrictEqual(Some([2, 'c']))
    expect(enumerate.next()).toStrictEqual(None)
  })

  it('should work with empty iterator', () => {
    const iter = [].iter()
    const enumerate = new Enumerate(iter)

    expect(enumerate.next()).toStrictEqual(None)
  })

  it('should support count method', () => {
    const iter = ['x', 'y'].iter()
    const enumerate = new Enumerate(iter)

    expect(enumerate.count()).toBe(2)
  })
})

describe('fuse', () => {
  it('should fuse iterator', () => {
    const iter = [1, 2, 3].iter()
    const fuse = new Fuse(iter)

    expect(fuse.next()).toStrictEqual(Some(1))
    expect(fuse.next()).toStrictEqual(Some(2))
    expect(fuse.next()).toStrictEqual(Some(3))
    expect(fuse.next()).toStrictEqual(None)
    expect(fuse.next()).toStrictEqual(None) // After None, always returns None
  })

  it('should work with empty iterator', () => {
    const iter = [].iter()
    const fuse = new Fuse(iter)

    expect(fuse.next()).toStrictEqual(None)
    expect(fuse.next()).toStrictEqual(None)
  })

  it('should support count method with custom implementation', () => {
    const iter = [1, 2, 3].iter()
    const fuse = new Fuse(iter)

    expect(fuse.count()).toBe(3)
  })
})

describe('inspect', () => {
  it('should inspect elements without modifying them', () => {
    const iter = [1, 2, 3].iter()
    const inspected: number[] = []
    const inspect = new Inspect(iter, x => inspected.push(x))

    expect(inspect.next()).toStrictEqual(Some(1))
    expect(inspected).toStrictEqual([1])
    expect(inspect.next()).toStrictEqual(Some(2))
    expect(inspected).toStrictEqual([1, 2])
    expect(inspect.next()).toStrictEqual(Some(3))
    expect(inspected).toStrictEqual([1, 2, 3])
    expect(inspect.next()).toStrictEqual(None)
  })

  it('should work with empty iterator', () => {
    const iter = [].iter()
    const inspected: number[] = []
    const inspect = new Inspect(iter, x => inspected.push(x))

    expect(inspect.next()).toStrictEqual(None)
    expect(inspected).toStrictEqual([])
  })
})

describe('intersperse', () => {
  it('should intersperse separator between elements', () => {
    const iter = [1, 2, 3].iter()
    const intersperse = new Intersperse(iter, 0)

    expect(intersperse.next()).toStrictEqual(Some(1))
    expect(intersperse.next()).toStrictEqual(Some(0))
    expect(intersperse.next()).toStrictEqual(Some(2))
    expect(intersperse.next()).toStrictEqual(Some(0))
    expect(intersperse.next()).toStrictEqual(Some(3))
    expect(intersperse.next()).toStrictEqual(None)
  })

  it('should work with single element', () => {
    const iter = [1].iter()
    const intersperse = new Intersperse(iter, 0)

    expect(intersperse.next()).toStrictEqual(Some(1))
    expect(intersperse.next()).toStrictEqual(None)
  })

  it('should work with empty iterator', () => {
    const iter = [].iter()
    const intersperse = new Intersperse(iter, 0)

    expect(intersperse.next()).toStrictEqual(None)
  })
})

describe('intersperseWith', () => {
  it('should intersperse using a function', () => {
    let count = 0
    const iter = [1, 2, 3].iter()
    const intersperse = new IntersperseWith(iter, () => count++)

    expect(intersperse.next()).toStrictEqual(Some(1))
    expect(intersperse.next()).toStrictEqual(Some(0))
    expect(intersperse.next()).toStrictEqual(Some(2))
    expect(intersperse.next()).toStrictEqual(Some(1))
    expect(intersperse.next()).toStrictEqual(Some(3))
    expect(intersperse.next()).toStrictEqual(None)
  })

  it('should work with empty iterator', () => {
    const iter = [].iter()
    const intersperse = new IntersperseWith(iter, () => 0)

    expect(intersperse.next()).toStrictEqual(None)
  })
})

describe('mapWhile', () => {
  it('should map elements while function returns Some', () => {
    const iter = [1, 2, 3, 4, 5].iter()
    const mapWhile = new MapWhile(iter, x => x < 4 ? Some(x * 2) : None)

    expect(mapWhile.next()).toStrictEqual(Some(2))
    expect(mapWhile.next()).toStrictEqual(Some(4))
    expect(mapWhile.next()).toStrictEqual(Some(6))
    expect(mapWhile.next()).toStrictEqual(None) // stops at 4
  })

  it('should work with empty iterator', () => {
    const iter = [].iter()
    const mapWhile = new MapWhile(iter, x => Some(x * 2))

    expect(mapWhile.next()).toStrictEqual(None)
  })

  it('should support collect method', () => {
    const iter = [1, 2, 3, 4, 5].iter()
    const mapWhile = new MapWhile(iter, x => x < 4 ? Some(x * 2) : None)

    expect(mapWhile.collect()).toStrictEqual([2, 4, 6])
  })
})

describe('peekable', () => {
  it('should peek at next element without consuming', () => {
    const iter = [1, 2, 3].iter()
    const peekable = new Peekable(iter)

    expect(peekable.peek()).toStrictEqual(Some(1))
    expect(peekable.peek()).toStrictEqual(Some(1)) // peek again, same value
    expect(peekable.next()).toStrictEqual(Some(1))
    expect(peekable.peek()).toStrictEqual(Some(2))
    expect(peekable.next()).toStrictEqual(Some(2))
    expect(peekable.peek()).toStrictEqual(Some(3))
    expect(peekable.next()).toStrictEqual(Some(3))
    expect(peekable.peek()).toStrictEqual(None)
    expect(peekable.next()).toStrictEqual(None)
  })

  it('should work with empty iterator', () => {
    const iter = [].iter()
    const peekable = new Peekable(iter)

    expect(peekable.peek()).toStrictEqual(None)
    expect(peekable.next()).toStrictEqual(None)
  })
})

describe('rev', () => {
  it('should reverse a double-ended iterator', () => {
    class TestDoubleEnded extends DoubleEndedIterator<number> {
      private arr = [1, 2, 3]
      private idx = 0

      next() {
        if (this.idx >= this.arr.length)
          return None
        return Some(this.arr[this.idx++])
      }

      next_back() {
        if (this.idx >= this.arr.length)
          return None
        this.idx++
        return Some(this.arr[this.arr.length - this.idx])
      }
    }

    const iter = new TestDoubleEnded()
    const rev = new Rev(iter)

    expect(rev.next()).toStrictEqual(Some(3))
    expect(rev.next()).toStrictEqual(Some(2))
    expect(rev.next()).toStrictEqual(Some(1))
    expect(rev.next()).toStrictEqual(None)
  })
})

describe('scan', () => {
  it('should scan with state', () => {
    const iter = [1, 2, 3].iter()
    const scan = new Scan(iter, 0, (acc, x) => acc + x)

    expect(scan.next()).toStrictEqual(Some(1)) // 0 + 1
    expect(scan.next()).toStrictEqual(Some(3)) // 1 + 2
    expect(scan.next()).toStrictEqual(Some(6)) // 3 + 3
    expect(scan.next()).toStrictEqual(None)
  })

  it('should work with empty iterator', () => {
    const iter = [].iter()
    const scan = new Scan(iter, 0, (acc, x) => acc + x)

    expect(scan.next()).toStrictEqual(None)
  })

  it('should support collect method', () => {
    const iter = [1, 2, 3].iter()
    const scan = new Scan(iter, 0, (acc, x) => acc + x)

    expect(scan.collect()).toStrictEqual([1, 3, 6])
  })
})

describe('stepBy', () => {
  it('should step by n elements', () => {
    const iter = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].iter()
    const stepBy = new StepBy(iter, 2)

    expect(stepBy.next()).toStrictEqual(Some(1))
    expect(stepBy.next()).toStrictEqual(Some(3))
    expect(stepBy.next()).toStrictEqual(Some(5))
    expect(stepBy.next()).toStrictEqual(Some(7))
    expect(stepBy.next()).toStrictEqual(Some(9))
    expect(stepBy.next()).toStrictEqual(None)
  })

  it('should throw error for step = 0', () => {
    const iter = [1, 2, 3].iter()
    expect(() => new StepBy(iter, 0)).toThrow('step_by: step must be greater than 0')
  })

  it('should work with step = 1', () => {
    const iter = [1, 2, 3].iter()
    const stepBy = new StepBy(iter, 1)

    expect(stepBy.next()).toStrictEqual(Some(1))
    expect(stepBy.next()).toStrictEqual(Some(2))
    expect(stepBy.next()).toStrictEqual(Some(3))
    expect(stepBy.next()).toStrictEqual(None)
  })

  it('should support collect method', () => {
    const iter = [1, 2, 3, 4, 5, 6].iter()
    const stepBy = new StepBy(iter, 2)

    expect(stepBy.collect()).toStrictEqual([1, 3, 5])
  })
})
