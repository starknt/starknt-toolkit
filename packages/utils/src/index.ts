import debug from 'debug'

export * from './async'
export * from './env'
export * from './json'
export * from './string'
export * from './types'
export * from './http'
export * from './array'
export * from './object'
export * from './math'
export * from './promise'
export * from './string'
export * from './p'
export * from './error'
export * from '@starknt/ts-results'
export * from 'ts-pattern'

export function createDebug(namespace: string) {
  return debug(namespace)
}

export function base64Encode(content: string) {
  return globalThis.btoa(content)
}

export function base64Decode(content: string) {
  return globalThis.atob(content)
}
