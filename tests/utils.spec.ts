import { describe, expect, it } from 'vitest'
import { Err, HeaderMap, HttpMethod, Ok, P, format, formatURL, match, parseJSON, stringifyJSON } from '@starknt/utils'

function buildBodyOrQuery(method: HttpMethod, queryOrBody?: HeaderMap | string) {
  return match({
    queryOrBody,
    method,
  })
    .returnType<string>()
    .with({
      queryOrBody: P.instanceOf(HeaderMap),
      method: HttpMethod.GET,
    }, ({ queryOrBody }) => formatURL('', queryOrBody!))
    .with({
      queryOrBody: P.instanceOf(HeaderMap),
      method: P.not(HttpMethod.GET),
    }, ({ queryOrBody }) => queryOrBody.toJSON())
    .with({ queryOrBody: undefined }, () => '')
    .otherwise(() => '')
}

describe('utils package', () => {
  it('test buildBodyOrQuery', () => {
    const headers = new HeaderMap()
    headers.insert('appid', 'appid')
    headers.insert('secret', 'secret')
    headers.insert('grant_type', 'authorization_code')
    headers.insert('code', 'code')

    expect(buildBodyOrQuery(HttpMethod.GET, headers))
      .toMatchInlineSnapshot(`"?appid=appid&secret=secret&grant_type=authorization_code&code=code"`)

    expect(buildBodyOrQuery(HttpMethod.POST, headers))
      .toMatchInlineSnapshot(`"{"appid":"appid","secret":"secret","grant_type":"authorization_code","code":"code"}"`)
  })

  it('format simple', () => {
    expect(format('hello {}', 'world')).toEqual('hello world')
  })

  it('format complex', () => {
    expect(format('hello {} and {}', 'world', 'universe')).toEqual('hello world and universe')
    expect(format('hello {} and {}', 'world')).toEqual('hello world and {}')
    expect(format('hello {}\nand\n{}', 'world', 'universe')).toEqual('hello world\nand\nuniverse')
    expect(format('hello {name}', { name: 'bob' })).toEqual('hello bob')
  })

  it('parseJSON simple', () => {
    expect(parseJSON('{"a": 1}')).toEqual(Ok({ a: 1 }))
    expect(parseJSON('{"a":1,"b":{"a":2}}')).toEqual(Ok({ a: 1, b: { a: 2 } }))
    expect(parseJSON('{"a": }')).toEqual(Err('Parse JSON ERROR: please check your input string is valid JSON, current input string: {"a": }'))
  })

  it('parseJSON complex', () => {
    expect(parseJSON(Ok('{"a": 1}'))).toEqual(Ok({ a: 1 }))
    expect(parseJSON(Err('error'))).toEqual(Err('error'))
    expect(parseJSON(Ok('{"a": }'))).toEqual(Err('Parse JSON ERROR: please check your input string is valid JSON, current input string: {"a": }'))
  })

  it('stringify JSON', () => {
    expect(stringifyJSON({ a: 1 })).toEqual(Ok('{"a":1}'))
    expect(stringifyJSON({ a: 1, b: { a: 2 } })).toEqual(Ok('{"a":1,"b":{"a":2}}'))
    expect(stringifyJSON(Err('error'))).toEqual(Err('error'))
    expect(stringifyJSON(Ok('{"a": }'))).toEqual(Ok('"{\\\"a\\\": }"'))
    expect(stringifyJSON({})).toEqual(Ok('{}'))
  })

  it('format url', () => {
    const base_url = 'https://api.mch.weixin.qq.com'
    const headers = new HeaderMap()
    headers.insert('grant_type', 'client_credential')
    headers.insert('appid', 'appid')
    headers.insert('secret', 'secret')
    const url = formatURL(
      `${base_url}/cgi-bin/token`,
      headers,
    )
    expect(url).toEqual('https://api.mch.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=appid&secret=secret')
  })
})
