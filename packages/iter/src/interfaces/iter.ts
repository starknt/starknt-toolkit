import type { Iterator } from '../traits/iter'

export interface IntoIterator<Item> {
  into_iter: () => Iterator<Item>
}

export type Iterable<Item> = IntoIterator<Item> | Iterator<Item>
