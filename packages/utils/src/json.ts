import { Err, Ok, Result } from '@starknt/ts-results'
import { format } from './string'

export function stringifyJSON<E>(o: Record<string, any> | Result<Record<string, any>, E>, replacer?: (key: string, value: any) => any): Result<string, string> {
  try {
    if (typeof o === 'object' && !Result.isResult(o))
      return Ok(JSON.stringify(o, replacer))
    if (o.isOk())
      return Ok(JSON.stringify(o.value, replacer))

    return o
  }
  catch (e) {
    if (e instanceof TypeError)
      return Err(format('[Stringify JSON ERROR]: please check your input object is valid JSON, current input object, stack: {}', e.stack))

    return Err(format('[Stringify JSON ERROR]: please check your input object is valid JSON, current input object: {}', Result.isResult(o) ? o.isOk() ? JSON.stringify(o.value) : 'UNKNOWN Object' : JSON.stringify(o)))
  }
}

export function parseJSON<T, E>(s: string | Result<string, E>, reviver?: (key: string, value: any) => any): Result<T, string | E> {
  try {
    if (typeof s === 'string')
      return Ok(JSON.parse(s, reviver))
    if (s.isOk())
      return Ok(JSON.parse(s.value, reviver))

    return s
  }
  catch (e) {
    if (e instanceof SyntaxError)
      return Err(format('[Parse JSON ERROR]: please check your input string is valid JSON, current input string: {}, stack: {}', typeof s === 'string' ? s : s.isOk() ? s.value : 'UNKNOWN String', e.stack))

    return Err(format('[Parse JSON ERROR]: please check your input string is valid JSON, current input string: {}', typeof s === 'string' ? s : s.isOk() ? s.value : ''))
  }
}
