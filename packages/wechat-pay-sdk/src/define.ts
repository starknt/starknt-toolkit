import { match } from '@starknt/utils'

export const AUTH_TYPE = 'WECHATPAY2-SHA256-RSA2048'

export enum RefundStatus {
  SUCCESS = 'SUCCESS',
  CLOSED = 'CLOSED',
  PROCESSING = 'PROCESSING',
  ABNORMAL = 'ABNORMAL',
}

/**
 * 交易状态，枚举值：
    - SUCCESS：支付成功
    - REFUND：转入退款
    - NOTPAY：未支付
    - CLOSED：已关闭
    - REVOKED：已撤销（仅付款码支付会返回）
    - USERPAYING：用户支付中（仅付款码支付会返回）
    - PAYERROR：支付失败（仅付款码支付会返回）
 */
export enum TradeState {
  SUCCESS = 'SUCCESS',
  REFUND = 'REFUND',
  NOTPAY = 'NOTPAY',
  CLOSED = 'CLOSED',
  REVOKED = 'REVOKED',
  USERPAYING = 'USERPAYING',
  PAYERROR = 'PAYERROR',
}

/**
 * 交易类型，枚举值：
    - JSAPI：公众号支付
    - NATIVE：扫码支付
    - APP：APP支付
    - MICROPAY：付款码支付
    - MWEB：H5支付
    - FACEPAY：刷脸支付
 */
export enum TradeType {
  JSAPI = 'JSAPI',
  NATIVE = 'NATIVE',
  APP = 'APP',
  MICROPAY = 'MICROPAY',
  MWEB = 'MWEB',
  FACEPAY = 'FACEPAY',
}

export enum PayType {
  Micro,
  JsApi,
  Native,
  App,
  H5,
  QRcode,
}

export function formatPayType(type: PayType): string {
  return match(type)
    .with(PayType.Micro, () => 'MICRO')
    .with(PayType.JsApi, () => 'JSAPI')
    .with(PayType.Native, () => 'NATIVE')
    .with(PayType.App, () => 'APP')
    .with(PayType.H5, () => 'H5')
    .with(PayType.QRcode, () => 'QRCODE')
    .otherwise(() => 'UNKNOWN')
}
