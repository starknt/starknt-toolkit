import process from 'node:process'
import type { Result } from '@starknt/ts-results'
import { Err, Ok } from '@starknt/ts-results'
import { isBoolean, isNumber, isUndefined } from './types'

export namespace env {
  /**
   * A function that retrieves the value of the specified environment variable.
   *
   * @param {string} name - the name of the environment variable
   * @return {Result<string, string>} Result type containing the value of the environment variable or an error message
   */
  export function variable<T extends string | boolean | number = string, R = T extends true | false ? boolean : T>(name: string, defaultValue?: T): Result<R, string> {
    const value = process.env[name]
    if (isUndefined(value) && isUndefined(defaultValue))
      return Err(`Environment variable ${name} is not set`)
    else if (isUndefined(value) && defaultValue !== undefined)
      return Ok(defaultValue as unknown as R)

    if (isUndefined(defaultValue))
      return Ok(value as R)
    if (isBoolean(defaultValue))
      return Ok(Boolean(value) as R)
    if (isNumber(defaultValue))
      return Ok(Number(value) as R)

    return Ok(value! as R)
  }
}
