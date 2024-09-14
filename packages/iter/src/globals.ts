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
  return new class extends Iterator<any> {
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
  }()
}

// eslint-disable-next-line no-extend-native
Set.prototype.iter = function () {
  // eslint-disable-next-line ts/no-this-alias
  const self = this

  return new class extends Iterator<any> {
    private values = self.values()

    next(): Option<any> {
      const entry = this.values.next()
      if (entry.done)
        return None
      return Some(entry.value)
    }
  }()
}

// eslint-disable-next-line no-extend-native
Map.prototype.iter = function () {
  // eslint-disable-next-line ts/no-this-alias
  const self = this

  return new class extends Iterator<any> {
    private values = self.values()

    next(): Option<any> {
      const entry = this.values.next()
      if (entry.done)
        return None
      return Some(entry.value)
    }
  }()
}

export {}
