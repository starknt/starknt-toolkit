import type { RefundStatus, TradeState, TradeType } from './define'
import type { AmountInfo, FundAccount, PayerInfo, Promotion, RefundChannel, RefundResponseAmountInfo, SceneInfo } from './model'

export interface NativeResponse {
  code?: string
  message?: string
  /** @description 【支付跳转链接】 h5_url为拉起微信支付收银台的中间页面，可通过访问该URL来拉起微信客户端，完成支付，h5_url的有效期为5分钟。 */
  code_url?: string
}

export interface JsapiResponse {
  code?: string
  message?: string
  /** @description 【预支付交易会话标识】 预支付交易会话标识。用于后续接口调用中使用，该值有效期为2小时 */
  prepay_id?: string
  /** @description 【签名数据】 */
  sign_data?: SignData
}

export interface SignData {
  app_id: string
  sign_type: string
  package: string
  nonce_str: string
  timestamp: string
  pay_sign: string
}

export interface AppResponse {
  code?: string
  message?: string
  /** @description 【预支付交易会话标识】 预支付交易会话标识。用于后续接口调用中使用，该值有效期为2小时 */
  prepay_id?: string
  /** @description 【签名数据】 */
  sign_data?: SignData
}

export interface MicroResponse {
  code?: string
  message?: string
  /** @description 【预支付交易会话标识】 预支付交易会话标识。用于后续接口调用中使用，该值有效期为2小时 */
  prepay_id?: string
  /** @description 【签名数据】 */
  sign_data?: SignData
}

export interface H5Response {
  code?: string
  message?: string
  /**
   * @description
   * 【支付跳转链接】 `h5_url` 为拉起微信支付收银台的中间页面，可通过访问该URL来拉起微信客户端，完成支付，`h5_url` 的有效期为5分钟。
   *  注意：`code_url`并非固定值，使用时按照URL格式转成二维码即可。
   */
  h5_url?: string
}

export interface EncryptCertificate {
  algorithm: string
  nonce: string
  associated_data: string
  ciphertext: string
}

export interface Certificate {
  serial_no: string
  effective_time: string
  expire_time: string
  encrypt_certificate: EncryptCertificate
}

export interface CertificateResponse {
  data?: Array<Certificate>
}

export interface CloseOrderResponse {

}

export interface RefundResponse {
  refund_id: string
  out_refund_no: string
  transaction_id: string
  out_trade_no: string
  channel: RefundChannel
  user_received_amount: string
  success_time: string
  create_time: string
  status: RefundStatus
  funds_account: FundAccount
  amount: RefundResponseAmountInfo
  promotion_detail?: Array<Promotion>
}

export interface QueryResponse {
  appid: string
  mchid: string
  out_trade_no: string
  transaction_id: string
  trade_type: TradeType
  trade_state: TradeState
  trade_state_desc: string
  bank_type: string
  attach: string
  success_time: string
  payer: PayerInfo
  amount?: AmountInfo
  scene_info?: SceneInfo
  promotion_detail?: Array<Promotion>
}

export interface SandboxGetSignKeyResponse {
  return_code: 'SUCCESS' | 'FAIL'
  return_msg?: string
  mch_id: string
  sandbox_signkey?: string
}

export interface ErrorResponse {
  code: string
  message: string
}
