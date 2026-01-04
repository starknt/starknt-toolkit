import type { Option } from '@starknt/utils'
import { None, Some } from '@starknt/utils'
import { Iterator } from './traits/iter'

declare global {
  interface Array<T> {
    iter(): Iterator<T>
  }

  interface Set<T> {
    iter(): Iterator<T>
  }

  // eslint-disable-next-line unused-imports/no-unused-vars
  interface Map<K, V> {
    iter(): Iterator<V>
  }
}

// eslint-disable-next-line no-extend-native
Array.prototype.iter = function () {
  // eslint-disable-next-line ts/no-this-alias
  const self = this
  const IteratorClass = class extends Iterator<any> {
    private length = self.length
    private idx = 0

    constructor() {
      super()
    }

    next(): Option<any> {
      if (this.idx < this.length)
        return Some(self[this.idx++])
      return None
    }

    clone(): Iterator<any> {
      return new IteratorClass()
    }

    size_hint(): [number, Option<number>] {
      return [this.length - this.idx, Some(this.length - this.idx)]
    }
  }
  return new IteratorClass()
}

// eslint-disable-next-line no-extend-native
Set.prototype.iter = function () {
  // eslint-disable-next-line ts/no-this-alias
  const self = this

  const IteratorClass = class extends Iterator<any> {
    private values: IterableIterator<any>
    private initialSize: number
    private consumed: number

    constructor() {
      super()
      this.values = self.values()
      this.initialSize = self.size
      this.consumed = 0
    }

    clone(): Iterator<any> {
      return new IteratorClass()
    }

    next(): Option<any> {
      const entry = this.values.next()
      if (entry.done)
        return None
      this.consumed++
      return Some(entry.value)
    }

    size_hint(): [number, Option<number>] {
      const remaining = Math.max(0, this.initialSize - this.consumed)
      return [remaining, Some(remaining)]
    }
  }
  return new IteratorClass()
}

// eslint-disable-next-line no-extend-native
Map.prototype.iter = function () {
  // eslint-disable-next-line ts/no-this-alias
  const self = this

  const IteratorClass = class extends Iterator<any> {
    private values: IterableIterator<any>
    private initialSize: number
    private consumed: number

    constructor() {
      super()
      this.values = self.values()
      this.initialSize = self.size
      this.consumed = 0
    }

    clone(): Iterator<any> {
      return new IteratorClass()
    }

    next(): Option<any> {
      const entry = this.values.next()
      if (entry.done)
        return None
      this.consumed++
      return Some(entry.value)
    }

    size_hint(): [number, Option<number>] {
      const remaining = Math.max(0, this.initialSize - this.consumed)
      return [remaining, Some(remaining)]
    }
  }
  return new IteratorClass()
}

export {}
