import { Rev } from '../adapters/rev'
import { DoubleEndedIterator as BaseDoubleEndedIterator } from './double_ended_base'

/**
 * An iterator able to yield elements from both ends.
 * This class extends the base DoubleEndedIterator and adds adapter methods.
 */
export abstract class DoubleEndedIterator<const Item> extends BaseDoubleEndedIterator<Item> {
  /**
   * Reverses the iterator.
   * @returns Reversed iterator
   */
  rev(): Rev<DoubleEndedIterator<Item>, Item> {
    return new Rev<DoubleEndedIterator<Item>, Item>(this)
  }
}
