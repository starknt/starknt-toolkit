import type { Option } from '@starknt/utils'
import type { Iterator } from '../traits/iter'

/**
 * Iterator adapter that steps through elements by a given amount.
 */
export class StepBy<const Item, I extends Iterator<Item> = Iterator<Item>> {
  protected iter: I
  protected step: number
  protected first_take: boolean

  constructor(iter: I, step: number) {
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
}
