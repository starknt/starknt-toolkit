import path, { normalize } from 'node:path'
import fs from 'node:fs'
import type { Option } from '@starknt/utils'
import { None, Result, Some, match } from '@starknt/utils'

/**
 * Represents a file system path.
 */
export class Path {
  #parts: string[]

  /**
   * Creates a new Path instance with the specified file path.
   * @param {string} p - The file path.
   */
  constructor(p: string) {
    this.#parts = p.split(path.sep)
  }

  static from(p: string) {
    return new Path(p)
  }

  toString() {
    return this.#parts.join(path.sep)
  }

  get path() {
    return this.#parts.join(path.sep)
  }

  get size() {
    return this.#parts.length
  }

  /**
   * Get the filename of the path.
   * @return {string} The filename.
   */
  filename(): Option<string> {
    for (const part of normalize(this.path).split(path.sep).reverse()) {
      if (part !== '' && part !== '.' && part !== '..')
        return Some(part)
    }

    return None
  }

  /**
   * Get the extension of the path.
   * @return {string} The extension of the path.
   */
  extension(): string {
    return path.extname(this.path)
  }

  /**
   * Check if the path exists.
   * @return {boolean} True if the path exists, false otherwise.
   */
  exists(): boolean {
    return fs.existsSync(this.path)
  }

  /**
   * Get an iterator over the entries of the directory.
   * @return {fs.Dirent[]} An array of directory entries.
   */
  read_directory(): fs.Dirent[] {
    return fs.readdirSync(this.path, { withFileTypes: true })
  }

  /**
   * Read the symlink at the path.
   * @return {string} The path to the symlink target.
   */
  read_link(): string {
    return fs.readlinkSync(this.path)
  }

  /**
   * Get the metadata of the symlink.
   * @return {fs.Stats} The metadata of the symlink.
   */
  symlink_metadata(): fs.Stats {
    return fs.lstatSync(this.path)
  }

  /**
   * Get the metadata of the path.
   * @return {fs.Stats} The metadata of the path.
   */
  metadata(): fs.Stats {
    return fs.statSync(this.path)
  }

  /**
   * Join the path with the given path segments.
   * @param {string | Path} p - The path segments to join.
   * @return {Path} The joined path.
   */
  join(p: Path | string): Path {
    if (p instanceof Path && p.is_absolute())
      return p

    if (typeof p === 'string')
      p = new Path(p)

    if (p.is_absolute())
      return p

    return new Path(path.join(this.path, p.toString()))
  }

  /**
   * Get the file prefix of the path.
   * @return {string} The file prefix.
   */
  file_prefix(): string {
    return path.parse(this.path).name
  }

  /**
   * Get the file stem of the path.
   * @return {string} The file stem.
   */
  file_stem(): Option<string> {
    const stem = path.parse(this.path).name

    if (stem === '' || stem === '.' || stem === '..')
      return None

    return Some(stem)
  }

  /**
   * Check if the path ends with the given suffix.
   * @param {string} suffix - The suffix to check.
   * @return {boolean} True if the path ends with the suffix, false otherwise.
   */
  ends_with(_suffix: string): boolean {
    throw new Error('Not implemented')
  }

  /**
   * Check if the path starts with the given prefix.
   * @param prefix The prefix to check.
   * @return True if the path starts with the prefix, false otherwise.
   */
  starts_with(_prefix: string): boolean {
    throw new Error('Not implemented')
  }

  /**
   * Get the parent directory of the path.
   * @return {Path} The parent directory path.
   */
  parent(): Path {
    return new Path(path.dirname(this.path))
  }

  /**
   * Check if the path is relative.
   * @return {boolean} True if the path is relative, false otherwise.
   */
  is_relative(): boolean {
    return !path.isAbsolute(this.path)
  }

  /**
   * Check if the path is absolute.
   * @return {boolean} True if the path is absolute, false otherwise.
   */
  is_absolute(): boolean {
    return path.isAbsolute(this.path)
  }

  has_root(): boolean {
    return path.parse(this.path).root !== ''
  }

  strip_prefix(base: string | Path) {
    if (typeof base === 'string')
      base = new Path(base)

    const p = path.parse(this.path)
    p.base = base.toString()
    return new Path(path.format(p))
  }

  with_filename(filename: string) {
    this.#parts[this.size - 1] = filename
    return this
  }

  with_extension(extension: string) {
    const p = path.parse(this.path)
    p.ext = extension.startsWith('.') ? extension : extension === '' ? '' : `.${extension}`
    return new Path(`${p.name}${p.ext}`)
  }

  is_file(): boolean {
    return fs.lstatSync(this.path).isFile()
  }

  is_directory(): boolean {
    return fs.lstatSync(this.path).isDirectory()
  }

  is_symlink(): boolean {
    return fs.lstatSync(this.path).isSymbolicLink()
  }
}
