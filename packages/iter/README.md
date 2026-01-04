# @starknt/iter

TypeScript 迭代器库，受 Rust 的 Iterator trait 启发。

## 特性

- 🦀 受 Rust Iterator 启发，提供相似的 API
- 🔄 惰性求值，支持链式调用
- 📦 类型安全，完整的 TypeScript 支持
- 🎯 丰富的适配器方法（map, filter, take, skip, chain, zip, flat_map, flatten, step_by, peekable 等）
- 🌐 全局扩展，为 Array、Set、Map 添加 `iter()` 方法

## 安装

```bash
pnpm add @starknt/iter
# 或
npm install @starknt/iter
# 或
yarn add @starknt/iter
```

## 快速开始

### 基本使用

```typescript
import { Iterator } from '@starknt/iter'
import '@starknt/iter/globals' // 启用全局扩展

// 使用全局扩展
const numbers = [1, 2, 3, 4, 5]
const doubled = numbers.iter()
  .map(x => x * 2)
  .filter(x => x > 5)
  .collect()

console.log(doubled) // [6, 8, 10]

// 创建自定义迭代器
class Range extends Iterator<number> {
  private start: number
  private end: number

  constructor(start: number, end: number) {
    super()
    this.start = start
    this.end = end
  }

  next(): Option<number> {
    if (this.start < this.end) {
      return Some(this.start++)
    }
    return None
  }
}

const range = new Range(1, 5)
const sum = range.sum()
console.log(sum) // 10
```

## API 文档

### 源代码适配器

#### `once<T>(value: T): Once<T>`

创建一个只产生一个值的迭代器。

```typescript
import { once } from '@starknt/iter'

const iter = once(42)
console.log(iter.next()) // Some(42)
console.log(iter.next()) // None
```

#### `empty<T>(): Empty<T>`

创建一个空迭代器。

```typescript
import { empty } from '@starknt/iter'

const iter = empty<number>()
console.log(iter.next()) // None
```

#### `repeat<T>(value: T): Repeat<T>`

创建一个无限重复值的迭代器。

```typescript
import { repeat } from '@starknt/iter'

const iter = repeat(42)
console.log(iter.next()) // Some(42)
console.log(iter.next()) // Some(42)
// ... 无限重复
```

#### `from_fn<T>(f: () => Option<T>): FromFn<T>`

从函数创建迭代器。

```typescript
import type { Option } from '@starknt/utils'
import { from_fn, None, Some } from '@starknt/iter'

let count = 0
const iter = from_fn<number>(() => {
  if (count < 3) {
    return Some(count++)
  }
  return None
})
```

### 适配器方法

#### `map<F>(f: F): Map<Item, ReturnType<F>>`

对每个元素应用函数。

```typescript
[1, 2, 3].iter().map(x => x * 2).collect() // [2, 4, 6]
```

#### `filter<P>(predicate: P): Filter<Item>`

过滤满足条件的元素。

```typescript
[1, 2, 3, 4, 5].iter().filter(x => x % 2 === 0).collect() // [2, 4]
```

#### `take(n: number): Take<Item>`

取前 n 个元素。

```typescript
[1, 2, 3, 4, 5].iter().take(3).collect() // [1, 2, 3]
```

#### `skip(n: number): Skip<Item>`

跳过前 n 个元素。

```typescript
[1, 2, 3, 4, 5].iter().skip(2).collect() // [3, 4, 5]
```

#### `take_while<P>(predicate: P): TakeWhile<Item>`

取满足条件的元素，直到遇到第一个不满足的元素。

```typescript
[2, 4, 6, 7, 8].iter().take_while(x => x % 2 === 0).collect() // [2, 4, 6]
```

#### `skip_while<P>(predicate: P): SkipWhile<Item>`

跳过满足条件的元素，直到遇到第一个不满足的元素。

```typescript
[2, 4, 6, 7, 8].iter().skip_while(x => x % 2 === 0).collect() // [7, 8]
```

#### `chain<U>(other: U): Chain<...>`

连接两个迭代器。

```typescript
[1, 2].iter().chain([3, 4].iter()).collect() // [1, 2, 3, 4]
```

#### `zip<ItemB>(other: Iterator<ItemB>): Zip<Item, ItemB>`

将两个迭代器压缩为元组迭代器。

```typescript
[1, 2, 3].iter().zip([4, 5, 6].iter()).collect() // [[1, 4], [2, 5], [3, 6]]
```

#### `enumerate(): Enumerate<Item>`

为元素添加索引。

```typescript
['a', 'b', 'c'].iter().enumerate().collect() // [[0, 'a'], [1, 'b'], [2, 'c']]
```

#### `cycle(): Cycle<Item>`

无限循环迭代器。

```typescript
[1, 2, 3].iter().cycle().take(7).collect() // [1, 2, 3, 1, 2, 3, 1]
```

#### `flat_map<Output>(f: (item: Item) => IntoIterator<Output>): FlatMap<Item, Output>`

对每个元素应用函数，返回迭代器，然后扁平化结果。

```typescript
[1, 2, 3].iter().flat_map(x => [x, x * 2].iter()).collect() // [1, 2, 2, 4, 3, 6]
```

#### `flatten<InnerItem>(): Flatten<InnerItem>`

扁平化嵌套迭代器。

```typescript
const nested = [[1, 2].iter(), [3, 4].iter()].iter()
nested.flatten().collect() // [1, 2, 3, 4]
```

#### `step_by(step: number): StepBy<Item>`

步进迭代，每隔 step 个元素取一个。

```typescript
[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].iter().step_by(2).collect() // [1, 3, 5, 7, 9]
```

#### `peekable(): Peekable<Item>`

创建可预览的迭代器，可以预览下一个元素而不消费它。

```typescript
const iter = [1, 2, 3].iter().peekable()
iter.peek() // Some(1)
iter.peek() // Some(1) (仍然可用)
iter.next() // Some(1)
iter.peek() // Some(2)
iter.next() // Some(2)
```

#### `scan<State>(initial_state: State, f: (state: State, item: Item) => State): Scan<Item, State>`

状态累积迭代器，类似 `fold`，但返回迭代器，每个元素都会产生一个状态值。

```typescript
[1, 2, 3].iter().scan(0, (acc, x) => acc + x).collect() // [1, 3, 6]
```

#### `inspect<F>(f: F): Inspect<Item>`

对每个元素执行副作用函数（如打印），但不改变元素。

```typescript
[1, 2, 3].iter().inspect(x => console.log(x)).collect() // [1, 2, 3] (同时打印每个元素)
```

#### `map_while<F>(f: F): MapWhile<Item, Output>`

类似 `filter_map`，但在遇到第一个 `None` 时停止迭代。

```typescript
[1, 2, 3, 4].iter().map_while(x => x < 3 ? Some(x * 2) : None).collect() // [2, 4]
```

#### `intersperse(separator: Item): Intersperse<Item>`

在元素之间插入固定的分隔符。

```typescript
[1, 2, 3].iter().intersperse(0).collect() // [1, 0, 2, 0, 3]
```

#### `intersperse_with<F>(f: F): IntersperseWith<Item>`

在元素之间插入由函数生成的分隔符。

```typescript
[1, 2, 3].iter().intersperse_with(() => 0).collect() // [1, 0, 2, 0, 3]
```

### 消费方法

#### `collect(): Item[]`

收集所有元素到数组。

```typescript
[1, 2, 3].iter().map(x => x * 2).collect() // [2, 4, 6]
```

#### `collect_vec(): Item[]`

`collect()` 的别名。

#### `fold<B>(init: B, f: (acc: B, item: Item) => B): B`

累积操作。

```typescript
[1, 2, 3, 4].iter().fold(0, (acc, x) => acc + x) // 10
```

#### `sum(): number`

求和（仅适用于数字）。

```typescript
[1, 2, 3, 4].iter().sum() // 10
```

#### `count(): number`

计算元素数量。

```typescript
[1, 2, 3].iter().count() // 3
```

#### `all<F>(f: F): boolean`

检查所有元素是否满足条件。

```typescript
[2, 4, 6].iter().all(x => x % 2 === 0) // true
```

#### `any<F>(f: F): boolean`

检查是否存在满足条件的元素。

```typescript
[1, 3, 4].iter().any(x => x % 2 === 0) // true
```

#### `find<P>(predicate: P): Option<Item>`

查找第一个满足条件的元素。

```typescript
[1, 2, 3, 4].iter().find(x => x > 2) // Some(3)
```

#### `last(): Option<Item>`

获取最后一个元素。

```typescript
[1, 2, 3].iter().last() // Some(3)
```

#### `partition<P>(predicate: P): [Item[], Item[]]`

将元素分为两部分。

```typescript
[1, 2, 3, 4].iter().partition(x => x % 2 === 0) // [[2, 4], [1, 3]]
```

#### `unzip<A, B>(): [A[], B[]]`

解压缩元组迭代器（需要迭代器类型为 `Iterator<[A, B]>`）。

```typescript
const pairs: Iterator<[string, number]> = [['a', 1], ['b', 2]].iter()
const [keys, values] = pairs.unzip()
```

## 全局扩展

导入 `@starknt/iter/globals` 后，以下类型会获得 `iter()` 方法：

- `Array<T>`
- `Set<T>`
- `Map<K, V>` (返回值的迭代器)

```typescript
import '@starknt/iter/globals'

const arr = [1, 2, 3]
const set = new Set([1, 2, 3])
const map = new Map([['a', 1], ['b', 2]])

arr.iter() // Iterator<number>
set.iter() // Iterator<number>
map.iter() // Iterator<number> (值)
```

## 与 Rust Iterator 的对比

本库的设计和 API 很大程度上受到了 Rust 标准库的 `Iterator` trait 的启发。主要对应关系：

| Rust | TypeScript (@starknt/iter) |
|------|---------------------------|
| `Iterator::map` | `Iterator::map` |
| `Iterator::filter` | `Iterator::filter` |
| `Iterator::take` | `Iterator::take` |
| `Iterator::skip` | `Iterator::skip` |
| `Iterator::chain` | `Iterator::chain` |
| `Iterator::zip` | `Iterator::zip` |
| `Iterator::enumerate` | `Iterator::enumerate` |
| `Iterator::cycle` | `Iterator::cycle` |
| `Iterator::fold` | `Iterator::fold` |
| `Iterator::collect` | `Iterator::collect` |
| `Iterator::sum` | `Iterator::sum` |
| `Iterator::count` | `Iterator::count` |
| `Iterator::all` | `Iterator::all` |
| `Iterator::any` | `Iterator::any` |
| `Iterator::find` | `Iterator::find` |
| `Iterator::last` | `Iterator::last` |
| `Iterator::partition` | `Iterator::partition` |
| `Iterator::unzip` | `Iterator::unzip` |
| `Iterator::scan` | `Iterator::scan` |
| `Iterator::inspect` | `Iterator::inspect` |
| `Iterator::map_while` | `Iterator::map_while` |
| `Iterator::intersperse` | `Iterator::intersperse` |
| `Iterator::intersperse_with` | `Iterator::intersperse_with` |
| `std::iter::once` | `once` |
| `std::iter::empty` | `empty` |
| `std::iter::repeat` | `repeat` |
| `std::iter::from_fn` | `from_fn` |

## 类型安全

本库充分利用 TypeScript 的类型系统，提供完整的类型推断：

```typescript
const numbers = [1, 2, 3].iter().map(x => x * 2).filter(x => x > 3).collect() // number[]

// 类型错误会被 TypeScript 捕获
numbers.iter().map(x => x.toUpperCase()) // 错误：number 没有 toUpperCase 方法
```

## 许可证

MIT
