import type { Option } from '@starknt/utils'
import { None, Some } from '@starknt/utils'
import { Iterator } from '../traits/base'

/**
 * Iterator adapter that steps through elements by a given amount.
 */
export class StepBy<I extends Iterator<Item>, Item = I extends Iterator<infer Item> ? Item : never> extends Iterator<Item> {
  protected iter: I
  protected step: number
  protected first_take: boolean

  constructor(iter: I, step: number) {
    super()
    if (step === 0) {
      throw new Error('step_by: step must be greater than 0')
    }
    this.iter = iter
    this.step = step
    this.first_take = true
  }

  next(): Option<Item> {
    if (this.first_take) {
      this.first_take = false
      return this.iter.next()
    }

    return this.iter.nth(this.step - 1)
  }

  clone(): StepBy<I, Item> {
    return new StepBy(this.iter.clone() as I, this.step)
  }

  size_hint(): [number, Option<number>] {
    const [lower, upper] = this.iter.size_hint()
    // Divide by step, rounding up
    const stepped_lower = Math.ceil(lower / this.step)
    const stepped_upper = upper.match({
      Some: u => Some(Math.ceil(u / this.step)) as Option<number>,
      None: () => None,
    })
    return [stepped_lower, stepped_upper]
  }
}
