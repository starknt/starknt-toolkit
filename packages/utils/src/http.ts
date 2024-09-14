import { P, match } from 'ts-pattern'

export const ACCEPT = 'Accept'
export const ACCEPT_ENCODING = 'Accept-Encoding'
export const CONTENT_TYPE = 'Content-Type'
export const USER_AGENT = 'User-Agent'
export const AUTHORIZATION = 'Authorization'
export const REFERER = 'Referer'

export type HeadersInit = [string, string][] | Record<string, string> | Headers

export class HeaderMap {
  private headers = new Map<string, string>()

  insert(key: string, value: string | boolean): this {
    this.headers.set(key, String(value))
    return this
  }

  isEmpty(): boolean {
    return this.headers.size === 0
  }

  clear(): this {
    this.headers.clear()
    return this
  }

  get(key: string) {
    return this.headers.get(key)
  }

  getIgnoreCase(key: string) {
    if (this.headers.has(key))
      return this.headers.get(key)
    else if (this.headers.has(key.toLowerCase()))
      return this.headers.get(key.toLowerCase())
    else
      return this.headers.get(key.toUpperCase())
  }

  keys() {
    return this.headers.keys()
  }

  values() {
    return this.headers.values()
  }

  remove(key: string) {
    return this.headers.delete(key)
  }

  [Symbol.iterator]() {
    return this.headers.entries()
  }

  [Symbol.toStringTag]() {
    return [...this.headers.entries()].map(([key, value]) => `${key}: ${value}`).join('\n')
  }

  [Symbol.toPrimitive]() {
    return Object.fromEntries([...this.headers.entries()])
  }

  toObject() {
    return Object.fromEntries([...this.headers.entries()])
  }

  toString() {
    return [...this.headers.entries()].map(([key, value]) => `${key}: ${value}`).join('\n')
  }

  toJSON() {
    return JSON.stringify(Object.fromEntries([...this.headers.entries()]))
  }

  static fromHeaders(headers: HeadersInit) {
    return match(headers)
      .returnType<HeaderMap>()
      .with(P.instanceOf(Headers), (headers) => {
        const map = new HeaderMap()
        for (const [key, value] of headers.entries())
          map.insert(key, value)
        return map
      })
      .with(P.array(), (headers) => {
        const map = new HeaderMap()
        for (const [key, value] of headers)
          map.insert(key, value)
        return map
      })
      .otherwise((headers) => {
        const map = new HeaderMap()
        for (const [key, value] of Object.entries(headers))
          map.insert(key, value)
        return map
      })
  }
}

type _HttpMethod = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'CONNECT' | 'OPTIONS' | 'TRACE' | 'PATCH'

export enum HttpMethod {
  GET,
  POST,
  PUT,
  DELETE,
  PATCH,
}

export function formatHttpMethod(method: HttpMethod): _HttpMethod {
  return match(method)
    .returnType<_HttpMethod>()
    .with(HttpMethod.GET, () => 'GET')
    .with(HttpMethod.POST, () => 'POST')
    .with(HttpMethod.PUT, () => 'PUT')
    .with(HttpMethod.DELETE, () => 'DELETE')
    .with(HttpMethod.PATCH, () => 'PATCH')
    .otherwise(() => 'GET')
}

export function formatURL(url: string): string
export function formatURL(url: string, header: HeaderMap): string
export function formatURL(url: string, k: string, v: string): string
export function formatURL(url: string, headerMap?: HeaderMap | string, v?: string): string {
  return match(headerMap)
    .returnType<string>()
    .with(P.string, (header) => {
      if (url.includes('?'))
        return url = `${url}&${header}=${v}`
      else
        return url = `${url}?${header}=${v}`
    })
    .with(P.instanceOf(HeaderMap), (map) => {
      for (const [k, v] of map!) {
        match(url)
          .when(l => l.includes('?'), l => url = `${l}&${k}=${v}`)
          .otherwise(() => url = `${url}?${k}=${v}`)
      }
      return url
    })
    .otherwise(_ => url)
}
