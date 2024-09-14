import type { ControlledPromise } from './promise'
import { createControlledPromise } from './promise'
import type { Fn } from './types'

/**
 * Checks if the given error is a promise in canceled state
 */
export function isCancellationError(error: any): boolean {
  if (error instanceof CancellationError)
    return true

  return error instanceof Error && error.name === 'Canceled' && error.message === 'Canceled'
}

export class CancellationError extends Error {
  constructor() {
    super('Canceled')
    this.name = this.message
  }
}

export interface CancellationToken {

  /**
   * A flag signalling is cancellation has been requested.
   */
  readonly isCancellationRequested: boolean

  /**
   * An event which fires when cancellation is requested. This event
   * only ever fires `once` as cancellation can only happen once. Listeners
   * that are registered after cancellation will be called (next event loop run),
   * but also only once.
   *
   * @event
   */
  readonly onCancellationRequested: (callback: Fn<void>) => void
}

export interface CancelablePromise<T> extends Promise<T> {
  cancel: () => void
}

export namespace CancellationToken {

  export function isCancellationToken(thing: unknown): thing is CancellationToken {
    if (thing === CancellationToken.None || thing === CancellationToken.Cancelled)
      return true

    if (thing instanceof MutableToken)
      return true

    if (!thing || typeof thing !== 'object')
      return false

    return typeof (thing as CancellationToken).isCancellationRequested === 'boolean'
      && typeof (thing as CancellationToken).onCancellationRequested === 'function'
  }

  export const None = Object.freeze<CancellationToken>({
    isCancellationRequested: false,
    onCancellationRequested: Promise.resolve().then,
  })

  export const Cancelled = Object.freeze<CancellationToken>({
    isCancellationRequested: true,
    onCancellationRequested: Promise.resolve().then,
  })
}

class MutableToken implements CancellationToken {
  private isCancelled: boolean = false
  private emitter: ControlledPromise<void> | null = null

  public cancel() {
    if (!this.isCancelled) {
      this.isCancelled = true
      if (this.emitter) {
        this.emitter.resolve()
        this.dispose()
      }
    }
  }

  get isCancellationRequested(): boolean {
    return this.isCancelled
  }

  get onCancellationRequested() {
    if (this.isCancelled) {
      const p = Promise.resolve()
      return p.then.bind(p)
    }

    if (!this.emitter)
      this.emitter = createControlledPromise()

    return this.emitter.then.bind(this.emitter)
  }

  public dispose(): void {
    if (this.emitter)
      this.emitter = null
  }
}

export class CancellationTokenSource {
  private _token?: CancellationToken = undefined

  constructor() {}

  get token(): CancellationToken {
    if (!this._token) {
      // be lazy and create the token only when
      // actually needed
      this._token = new MutableToken()
    }
    return this._token
  }

  cancel(): void {
    if (!this._token) {
      // save an object by returning the default
      // cancelled token when cancellation happens
      // before someone asks for the token
      this._token = CancellationToken.Cancelled
    }
    else if (this._token instanceof MutableToken) {
      // actually cancel
      this._token.cancel()
    }
  }

  dispose(cancel: boolean = false): void {
    if (cancel)
      this.cancel()

    if (!this._token) {
      // ensure to initialize with an empty token if we had none
      this._token = CancellationToken.None
    }
    else if (this._token instanceof MutableToken) {
      // actually dispose
      this._token.dispose()
    }
  }
}

export function createCancelablePromise<T>(callback: (token: CancellationToken) => Promise<T>): CancelablePromise<T> {
  const source = new CancellationTokenSource()

  const thenable = callback(source.token)
  const promise = new Promise<T>((resolve, reject) => {
    source.token.onCancellationRequested(() => {
      reject(new CancellationError())
    })
    Promise.resolve(thenable).then((value) => {
      source.dispose()
      resolve(value)
    }, (err) => {
      source.dispose()
      reject(err)
    })
  })

  return <CancelablePromise<T>> new class {
    cancel() {
      source.cancel()
      source.dispose()
    }

    then<TResult1 = T, TResult2 = never>(resolve?: ((value: T) => TResult1 | Promise<TResult1>) | undefined | null, reject?: ((reason: any) => TResult2 | Promise<TResult2>) | undefined | null): Promise<TResult1 | TResult2> {
      return promise.then(resolve, reject)
    }

    catch<TResult = never>(reject?: ((reason: any) => TResult | Promise<TResult>) | undefined | null): Promise<T | TResult> {
      return this.then(undefined, reject)
    }

    finally(onfinally?: (() => void) | undefined | null): Promise<T> {
      return promise.finally(onfinally)
    }
  }()
}
