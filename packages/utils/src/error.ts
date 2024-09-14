import { AsyncResult, Err, Ok, Result } from '@starknt/ts-results'

export function catchErr<R, E>(callback: () => Result<R, E>): Result<R, E>
export function catchErr<R, E>(callback: () => AsyncResult<R, E>): AsyncResult<R, E>
export function catchErr<R, E>(
  callback: () => Result<R, E> | AsyncResult<R, E>,
): Result<R, E> | AsyncResult<R, E> {
  let isAsync = false

  try {
    const result = callback()
    isAsync = result instanceof AsyncResult
    return result
  }
  catch (error) {
    if (isAsync && Result.isResult(error))
      return error.toAsyncResult()

    if (Result.isResult(error))
      return error

    throw error
  }
}

export function wrapErr<E extends Error, T extends (...args: any[]) => any, R = ReturnType<T>>(callback: T): Result<R, E> {
  try {
    return Ok(callback())
  }
  catch (error) {
    return Err(error as E)
  }
}
