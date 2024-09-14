import { createDebug, format } from '@starknt/utils'

const _debug = createDebug('wechat-pay-sdk')

export function debug(s: string, ...args: any[]) {
  _debug(format(s, ...args))
}
