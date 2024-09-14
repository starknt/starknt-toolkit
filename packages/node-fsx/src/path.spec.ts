import { platform } from 'node:process'
import { describe, expect, it } from 'vitest'
import type { Option } from '@starknt/utils'
import { None, Some, template } from '@starknt/utils'
import { Path } from './path'

function assert_eq<T>(actual: T, expected: T, message?: string, ...args: any[]) {
  expect(actual, message ? template(message, ...args) : message).toStrictEqual(expected)
}

describe('path unit test', () => {
  it('join path', () => {
    function tjp($path: string, $join: string, $expected: string) {
      const p = Path.from($path)

      assert_eq(p.join($join).path, $expected)
    }

    tjp('/etc', 'passwd', '/etc/passwd')
    tjp('/etc', '/bin/sh', '/bin/sh')
  })

  it('with filename', () => {
    function tfn($path: string, $file: string, $expected: Option<string>) {
      const p = Path.from($path)
      p.with_filename($file)

      assert_eq(p.filename(), $expected)
    }

    tfn('foo', 'foo', Some('foo'))
    tfn('foo', 'bar', Some('bar'))
    tfn('foo', '', None)
    tfn('', 'foo', Some('foo'))
    tfn('.', 'foo', Some('foo'))
    tfn('foo', 'bar', Some('bar'))
    tfn('foo\.', 'bar', Some('bar'))
    tfn('/tmp/foo.png', 'bar', Some('bar'))
    tfn('/tmp/foo.png', 'bar.txt', Some('bar.txt'))
    tfn('/tmp', 'var', Some('var'))
  })

  it('with extension', () => {
    function twe($input: string, $extension: string, $expected: string) {
      const input = Path.from($input)
      const output = input.with_extension($extension)

      assert_eq(output.path, $expected)
    }

    // twe('foo', 'txt', 'foo.txt')
    // twe('foo.bar', 'txt', 'foo.txt')
    // twe('foo.bar.baz', 'txt', 'foo.bar.txt')
    // twe('.test', 'txt', '.test.txt')
    // twe('foo.txt', '', 'foo')
    // twe('foo', '', 'foo')
    // twe('', 'foo', '')
    // twe('.', 'foo', '.')
    // twe('foo/', 'bar', 'foo.bar')
    // twe('foo/.', 'bar', 'foo.bar')
    // twe('..', 'foo', '..')
    // twe('foo/..', 'bar', 'foo/..')
    // twe('/', 'foo', '/')

    // New extension is smaller than file name
    twe('aaa_aaa_aaa', 'bbb_bbb', 'aaa_aaa_aaa.bbb_bbb')
    // New extension is greater than file name
    twe('bbb_bbb', 'aaa_aaa_aaa', 'bbb_bbb.aaa_aaa_aaa')

    // New extension is smaller than previous extension
    twe('ccc.aaa_aaa_aaa', 'bbb_bbb', 'ccc.bbb_bbb')
    // New extension is greater than previous extension
    twe('ccc.bbb_bbb', 'aaa_aaa_aaa', 'ccc.aaa_aaa_aaa')
  })

  it('absolute', () => {
    function tab($path: string, $expected: boolean) {
      const path = Path.from($path)
      assert_eq(path.is_absolute(), $expected)
    }

    if (platform === 'win32') {
      tab!('C:\\path\\to\\file', true)
      tab!('C:\\path\\to\\file\\', true)
      tab!('\\\\server\\share\\to\\file', true)
      tab!('\\\\server.\\share.\\to\\file', true)
      tab!('\\\\.\\PIPE\\name', true)
      tab!('\\\\.\\C:\\path\\to\\COM1', true)
      tab!('\\\\?\\C:\\path\\to\\file', true)
      tab!('\\\\?\\UNC\\server\\share\\to\\file', true)
      tab!('\\\\?\\PIPE\\name', true)
    }

    if (platform === 'linux' || platform === 'darwin') {
      tab!('/usr/bin', true)
      tab!('/path/to/file', true)
      tab!('/path/to/file/', true)
      tab!('/path/to/file//', true)

      tab!('path/to/file', false)
      tab!('path/to/file/', false)
      tab!('path/to/file//', false)
    }
  })

  it('filename', () => {
    function tfn($path: string, $expected: Option<string>) {
      const p = Path.from($path)
      assert_eq(p.filename(), $expected)
    }

    tfn('foo', Some('foo'))
    tfn('foo/bar', Some('bar'))
    tfn('foo/bar/baz', Some('baz'))
    tfn('foo/bar/baz/', Some('baz'))
    tfn('foo/bar/baz//', Some('baz'))
    tfn('foo/bar/baz/.', Some('baz'))
    tfn('foo/bar/baz/..', Some('bar'))
    tfn('foo/bar/baz/../', Some('bar'))
  })

  it('filestem', () => {
    function tfs($path: string, $expected: Option<string>) {
      const p = Path.from($path)
      assert_eq(p.file_stem(), $expected)
    }

    tfs('foo', Some('foo'))
    tfs('foo.', Some('foo'))
    tfs('.foo', Some('.foo'))
    tfs('foo.txt', Some('foo'))
    tfs('foo.bar.txt', Some('foo.bar'))
    tfs('foo.bar.', Some('foo.bar'))
    tfs('.', None)
    tfs('..', None)
    tfs('.x.y.z', Some('.x.y'))
    tfs('..x.y.z', Some('..x.y'))
    tfs('', None)
    tfs('foo.rs', Some('foo'))
    tfs('foo.tar.gz', Some('foo.tar'))
  })

  // it('strip prefix', () => {
  //   const path = Path.from('/test/haha/foo.txt')

  //   assert_eq(path.strip_prefix('/').toString(), 'test/haha/foo.txt')
  //   assert_eq(path.strip_prefix('/test').toString(), 'haha/foo.txt')
  //   assert_eq(path.strip_prefix('/test/').toString(), 'haha/foo.txt')
  //   assert_eq(path.strip_prefix('/test/haha').toString(), 'foo.txt')
  //   assert_eq(path.strip_prefix('/test/haha/').toString(), 'foo.txt')
  //   assert_eq!(path.strip_prefix('/test/haha/foo.txt').toString(), '')
  //   assert_eq!(path.strip_prefix('/test/haha/foo.txt/').toString(), '')

  //   // assert_eq(path.strip_prefix('test').is_err())
  //   // assert_eq(path.strip_prefix('/haha').is_err())
  // })

  // it('starts with', () => {
  //   function tsw($path: string, $prefix: string, $expected: boolean) {
  //     const p = Path.from($path)
  //     assert_eq(p.starts_with($prefix), $expected)
  //   }

  //   tsw('/etc/passwd', '/etc', true)
  //   tsw('/etc/passwd', '/etc/', true)
  //   tsw('/etc/passwd', '/etc/passwd', true)
  //   tsw('/etc/passwd', '/etc/passwd//', true)

  //   tsw('/etc/passwd', '/e', false)
  //   tsw('/etc/passwd', '/etc/passwd.txt', false)

  //   tsw('/etc/foo.rs', '/etc/foo', false)
  // })

  // it('ends with', () => {
  //   function tew($path: string, $suffix: string, $expected: boolean) {
  //     const p = Path.from($path)
  //     assert_eq(p.ends_with($suffix), $expected)
  //   }

  //   tew('/etc/resolv.conf', 'resolv.conf', true)
  //   tew('/etc/resolv.conf', 'etc/resolv.conf', true)
  //   tew('/etc/resolv.conf', '/etc/resolv.conf', true)

  //   tew('/etc/resolv.conf', '/resolv.conf', false)
  //   tew('/etc/resolv.conf', '.conf', false)
  // })

  it('parent path', () => {
    function tpp($path: string, $expected: string) {
      const p = Path.from($path)
      assert_eq(p.parent().path, $expected)
    }

    tpp('/foo/bar', '/foo')
    tpp('/foo', '/')
    tpp('/', '/')
    tpp('foo/bar', 'foo')
    tpp('foo', '.')
    tpp('.', '.')
  })
})
