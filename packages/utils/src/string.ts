import { isDefined, isObject } from './types'

/**
 * Replace backslash to slash
 *
 * @category String
 */
export function slash(str: string) {
  return str.replace(/\\/g, '/')
}

/**
 * Ensure prefix of a string
 *
 * @category String
 */
export function ensurePrefix(prefix: string, str: string) {
  if (!str.startsWith(prefix))
    return prefix + str
  return str
}

/**
 * Ensure suffix of a string
 *
 * @category String
 */
export function ensureSuffix(suffix: string, str: string) {
  if (!str.endsWith(suffix))
    return str + suffix
  return str
}

/**
 * Dead simple template engine, just like Python's `.format()`
 * Support passing variables as either in index based or object/name based approach
 * While using object/name based approach, you can pass a fallback value as the third argument
 *
 * @category String
 * @example
 * ```
 * const result = template(
 *   'Hello {0}! My name is {1}.',
 *   'Inès',
 *   'Anthony'
 * ) // Hello Inès! My name is Anthony.
 * ```
 *
 * ```
 * const result = namedTemplate(
 *   '{greet}! My name is {name}.',
 *   { greet: 'Hello', name: 'Anthony' }
 * ) // Hello! My name is Anthony.
 * ```
 *
 * const result = namedTemplate(
 *   '{greet}! My name is {name}.',
 *   { greet: 'Hello' }, // name isn't passed hence fallback will be used for name
 *   'placeholder'
 * ) // Hello! My name is placeholder.
 * ```
 */
export function template(str: string, object: Record<string | number, any>, fallback?: string | ((key: string) => string)): string
export function template(str: string, ...args: (string | number | bigint | undefined | null)[]): string
export function template(str: string, ...args: any[]): string {
  const [firstArg, fallback] = args

  if (isObject(firstArg)) {
    const vars = firstArg as Record<string, any>
    return str.replace(/{([\w\d]+)}/g, (_, key) => vars[key] || ((typeof fallback === 'function' ? fallback(key) : fallback) ?? key))
  }
  else {
    let idx = 0
    return str.replace(/{(\d+)?}/g, (fallback, key) => {
      if (isDefined(key)) {
        const index = Number(key)
        if (Number.isNaN(index))
          return key
        return args[index]
      }

      return args[idx++] ?? fallback
    })
  }
}

/**
 * Dead simple template engine, just like Python's `.format()`
 * Support passing variables as either in index based or object/name based approach
 * While using object/name based approach, you can pass a fallback value as the third argument
 *
 * @category String
 * @example
 * ```
 * const result = template(
 *   'Hello {0}! My name is {1}.',
 *   'Inès',
 *   'Anthony'
 * ) // Hello Inès! My name is Anthony.
 * ```
 *
 * ```
 * const result = namedTemplate(
 *   '{greet}! My name is {name}.',
 *   { greet: 'Hello', name: 'Anthony' }
 * ) // Hello! My name is Anthony.
 * ```
 *
 * const result = namedTemplate(
 *   '{greet}! My name is {name}.',
 *   { greet: 'Hello' }, // name isn't passed hence fallback will be used for name
 *   'placeholder'
 * ) // Hello! My name is placeholder.
 * ```
 */
export function format(str: string, object: Record<string | number, any>, fallback?: string | ((key: string) => string)): string
export function format(str: string, ...args: (string | number | bigint | undefined | null)[]): string
export function format(str: string, ...args: any[]) {
  return template(str, ...args)
}

// port from nanoid
// https://github.com/ai/nanoid
const urlAlphabet = 'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict'
/**
 * Generate a random string
 * @category String
 */
export function nanoid(size = 16, dict = urlAlphabet) {
  let id = ''
  let i = size
  const len = dict.length
  while (i--)
    id += dict[(Math.random() * len) | 0]
  return id
}

/**
 * First letter uppercase, other lowercase
 * @category string
 * @example
 * ```
 * capitalize('hello') => 'Hello'
 * ```
 */
export function capitalize(str: string): string {
  return str[0].toUpperCase() + str.slice(1).toLowerCase()
}
