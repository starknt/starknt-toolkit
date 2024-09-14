import assert from 'node:assert'
import { describe, expect, it } from 'vitest'
import { createCancelablePromise, isCancellationError } from './async'

describe('async file unit', () => {
  it('cancel promise', async () => {
    const promise = createCancelablePromise(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(1)
        }, 5000)
      })
    })

    ;(async () => {
      setTimeout(() => {
        promise.cancel()
      }, 3000)
    })()

    await promise
      .catch((e) => {
        expect(isCancellationError(e)).toBeTruthy()
        // console.error(e)
      })
  })

  it('set token, don\'t wait for inner promise', () => {
    let canceled = 0
    const promise = createCancelablePromise((token) => {
      token.onCancellationRequested(() => {
        canceled += 1
      })
      return new Promise(() => { /* never */ })
    })
    const result = promise
      .then(() => {
        assert.ok(false)
      }, (err) => {
        expect(canceled).eq(1)
        expect(isCancellationError(err)).toBeTruthy()
      })
    promise.cancel()
    promise.cancel() // cancel only once
    return result
  })

  it('cancel despite inner promise being resolved', () => {
    let canceled = 0
    const promise = createCancelablePromise((token) => {
      token.onCancellationRequested(() => {
        canceled += 1
      })
      return Promise.resolve(1234)
    })
    const result = promise.then((_) => {}, (err) => {
      expect(canceled).eq(1)
      expect(isCancellationError(err)).toBeTruthy()
    })
    promise.cancel()
    return result
  })
})
