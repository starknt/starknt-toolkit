export enum Currency {
  CNY = 'CNY',
}

export enum RefundAccount {
  AVAILABLE = 'AVAILABLE',
  UNAVAILABLE = 'UNAVAILABLE',
}

export enum FundAccount {
  UNSETTLED = 'UNSETTLED',
  AVAILABLE = 'AVAILABLE',
  UNAVAILABLE = 'UNAVAILABLE',
  OPERATION = 'OPERATION',
  BASIC = 'BASIC',
}

export enum RefundChannel {
  ORIGINAL = 'ORIGINAL',
  BALANCE = 'BALANCE',
  OTHER_BALANCE = 'OTHER_BALANCE',
  OTHER_BANKCARD = 'OTHER_BANKCARD',
}

export enum PromotionScope {
  GLOBAL = 'GLOBAL',
  SINGLE = 'SINGLE',
}

export enum PromotionType {
  COUPON = 'COUPON',
  DISCOUNT = 'DISCOUNT',
}

export function formatCurrency(currency: Currency): string {
  switch (currency) {
    case Currency.CNY:
      return 'CNY'
  }
}

export interface AmountInfo {
  /** @description 【标价金额】 订单总金额，单位为分。 */
  total: number
}

export interface RefundAmountInfo {
  /** @description 【退款金额】 订单退款金额，单位为分 */
  refund: number
  /** @description 【总金额】 订单总金额，单位为分 */
  total: number
  /** @description 【货币类型】 货币类型，符合ISO 4217标准的三位字母代码，目前只支持人民币：CNY */
  currency: Currency
  /** @description 【出资账户】 退款出资的账户类型及金额信息 */
  from?: Array<RefundAmountFrom>
}

export interface RefundResponseAmountInfo extends RefundAmountInfo {
  /** @description 【用户支付金额】现金支付金额，单位为分，只能为整数 */
  payer_total: number
  /** @description 【用户退款金额】现金退款金额，单位为分，不包含所有优惠券金额 */
  payer_refund: number
  /** @description 【退款给用户金额】退款给用户的金额，单位为分，退款金额=申请退款金额-非充值代金券退款金额，退款金额<=申请退款金额 */
  settlement_refund: number
  /** @description 【应结订单金额】应结订单金额=订单金额-免充值代金券金额，应结订单金额<=订单金额，单位为分 */
  settlement_total: number
  /** @description 【退款代金券退款总金额】优惠退款金额<=退款金额，退款金额-代金券或立减优惠退款金额为现金，说明详见代金券或立减优惠，单位为分 */
  discount_refund: number
  /** @description 【手续费退款金额】手续费退款金额，单位为分。 */
  refund_fee?: number
}

export interface RefundAmountFrom {
  /**
   * @description 【账户类型】 账户类型，目前支持
   * ```md
   * AVAILABLE: 可用余额
   * UNAVAILABLE: 不可用余额
   * ```
   */
  account: RefundAccount
  /** @description 【出资金额】 对应账户出资金额，单位为分 */
  amount: number
}

export interface PayerInfo {
  /** @description 【用户标识】 用户在直连商户appid下的唯一标识。 */
  openid: string
}

export interface GoodsDetail {
  /** @description 【商户侧商品编码】 由半角的大小写字母、数字、中划线、下划线中的一种或几种组成。 */
  merchant_goods_id: string
  /** @description 【商品数量】 用户购买的数量 */
  quantity: number
  /** @description 【商品单价】 单位为：分。如果商户有优惠，需传输商户优惠后的单价(例如：用户对一笔100元的订单使用了商场发的纸质优惠券100-50，则活动商品的单价应为原单价-50) */
  unit_price: number
  /** @description 【微信支付商品编码】 微信支付定义的统一商品编号（没有可不传） */
  wechatpay_goods_id?: string
  /** @description 【商品名称】 商品的实际名称 */
  goods_name?: string
}

export interface RefundGoodsDetail extends GoodsDetail {
  /** @description 【退款数量】 用户退款的数量 */
  refund_quantity: number
  /** @description 【退款单价】 单位为：分 */
  refund_amount: number
}

export interface OrderDetail {
  /**
   * @description
   * ```md
   * 1、商户侧一张小票订单可能被分多次支付，订单原价用于记录整张小票的交易金额。
   * 2、当订单原价与支付金额不相等，则不享受优惠。
   * 3、该字段主要用于防止同一张小票分多次支付，以享受多次优惠的情况，正常支付订单不必上传此参数。
   * ```
   */
  cost_price?: number
  /** @description 【商品小票ID】 商家小票ID   */
  invoice_id?: string
  /** @description 【单品列表】 单品列表信息,条目个数限制：【1，6000】 */
  goods_detail: Array<GoodsDetail>
}

export interface StoreInfo {
  /** @description 【门店编号】 商户侧门店编号 */
  id: string
  /** @description 【门店名称】 商户侧门店名称 */
  name?: string
  /** @description 【地区编码】 地区编码，详细请见省市区编号对照表。 */
  area_code?: string
  /** @description 【详细地址】 详细的商户门店地址 */
  address?: string
}

export interface SceneInfo {
  /** @description 【用户终端IP】 用户的客户端IP，支持IPv4和IPv6两种格式的IP地址。 */
  payer_client_ip: string
  /** @description 【商户端设备号】 商户端设备号（门店号或收银设备ID）。 */
  device_id?: string
  /** @description 【商户门店信息】 商户门店信息 */
  store_info?: StoreInfo
}

export enum H5Type {
  Ios,
  Android,
  Wap,
}

export function formatH5Type(type: H5Type): string {
  switch (type) {
    case H5Type.Ios:
      return 'IOS'
    case H5Type.Android:
      return 'ANDROID'
    case H5Type.Wap:
      return 'WAP'
  }
}

export interface H5Info {
  /** @description 【场景类型】 场景类型 */
  type: string
  /** @description 【应用名称】 应用名称 */
  app_name?: string
  /** @description 【网站URL】 网站URL */
  app_url?: string
  /** @description 【iOS平台BundleID】 iOS平台BundleID */
  bundle_id?: string
  /** @description 【Android平台PackageName】 Android平台PackageName */
  package_name?: string
}

export interface H5SceneInfo {
  /** @description 【用户终端IP】 用户的客户端IP，支持IPv4和IPv6两种格式的IP地址。 */
  payer_client_ip: string
  /** @description 【H5场景信息】 */
  h5_info: H5Info
  /** @description 【商户端设备号】 商户端设备号（门店号或收银设备ID）。 */
  device_id?: string
  /** @description 【商户门店信息】 商户门店信息 */
  store_info?: StoreInfo
}

export interface JsapiParams {
  /** @description【商品描述】 商品描述 */
  description: string
  /** @description【商户订单号】 商户系统内部订单号，只能是数字、大小写字母_-*且在同一个商户号下唯一。 */
  out_trade_no: string
  /** @description【订单金额】 订单金额信息 */
  amount: AmountInfo
  /** @description【支付者】 支付者信息 */
  payer: PayerInfo
  /** @description【附加数据】 附加数据，在查询API和支付通知中原样返回，可作为自定义参数使用，实际情况下只有支付完成状态才会返回该字段。 */
  attach?: string
  /** @description【优惠功能】 优惠功能 */
  detail?: OrderDetail
  /** @description【交易结束时间】 订单失效时间，遵循rfc3339标准格式，格式为yyyy-MM-DDTHH:mm:ss+TIMEZONE，yyyy-MM-DD表示年月日，T出现在字符串中，表示time元素的开头，HH:mm:ss表示时分秒，TIMEZONE表示时区（+08:00表示东八区时间，领先UTC8小时，即北京时间）。例如：2015-05-20T13:29:35+08:00表示，北京时间2015年5月20日13点29分35秒。 */
  time_expire?: string
  /** @description【场景信息】 支付场景描述 */
  scene_info?: SceneInfo
}

export interface MicroParams {
  /** @description【商品描述】 商品描述 */
  description: string
  /** @description【商户订单号】 商户系统内部订单号，只能是数字、大小写字母_-*且在同一个商户号下唯一。 */
  out_trade_no: string
  /** @description【订单金额】 订单金额信息 */
  amount: AmountInfo
  /** @description【支付者】 支付者信息 */
  payer: PayerInfo
  /** @description【附加数据】 附加数据，在查询API和支付通知中原样返回，可作为自定义参数使用，实际情况下只有支付完成状态才会返回该字段。 */
  attach?: string
  /** @description【优惠功能】 优惠功能 */
  detail?: OrderDetail
  /** @description【交易结束时间】 订单失效时间，遵循rfc3339标准格式，格式为yyyy-MM-DDTHH:mm:ss+TIMEZONE，yyyy-MM-DD表示年月日，T出现在字符串中，表示time元素的开头，HH:mm:ss表示时分秒，TIMEZONE表示时区（+08:00表示东八区时间，领先UTC8小时，即北京时间）。例如：2015-05-20T13:29:35+08:00表示，北京时间2015年5月20日13点29分35秒。 */
  time_expire?: string
  /** @description【场景信息】 支付场景描述 */
  scene_info?: SceneInfo
}

export interface SettleInfo {
  /** @description【是否指定分账】 是否指定分账， */
  profit_sharing?: boolean
}

export interface NativeParams {
  /** @description【商品描述】 商品描述 */
  description: string
  /** @description【商户订单号】 商户系统内部订单号，只能是数字、大小写字母_-*且在同一个商户号下唯一。 */
  out_trade_no: string
  /** @description【订单金额】 订单金额信息 */
  amount: AmountInfo
  /** @description【交易结束时间】 订单失效时间，遵循rfc3339标准格式，格式为yyyy-MM-DDTHH:mm:ss+TIMEZONE，yyyy-MM-DD表示年月日，T出现在字符串中，表示time元素的开头，HH:mm:ss表示时分秒，TIMEZONE表示时区（+08:00表示东八区时间，领先UTC8小时，即北京时间）。例如：2015-05-20T13:29:35+08:00表示，北京时间2015年5月20日13点29分35秒。 */
  time_expire?: string
  /** @description【附加数据】 附加数据，在查询API和支付通知中原样返回，可作为自定义参数使用，实际情况下只有支付完成状态才会返回该字段。 */
  attach?: string
  /** @description【订单优惠标记】 商品标记，代金券或立减优惠功能的参数。 */
  goods_tag?: string
  /** @description【电子发票入口开放标识】 传入true时，支付成功消息和支付详情页将出现开票入口。需要在微信支付商户平台或微信公众平台开通电子发票功能，传此字段才可生效。 */
  support_fapiao?: boolean
  /** @description【场景信息】 支付场景描述 */
  scene_info?: SceneInfo
  /** @description【结算信息】 结算信息 */
  settle_info?: SettleInfo
}

export interface AppParams {
  /** @description【商品描述】 商品描述 */
  description: string
  /** @description【商户订单号】 商户系统内部订单号，只能是数字、大小写字母_-*且在同一个商户号下唯一。 */
  out_trade_no: string
  /** @description【订单金额】 订单金额信息 */
  amount: AmountInfo
  /** @description【交易结束时间】 订单失效时间，遵循rfc3339标准格式，格式为yyyy-MM-DDTHH:mm:ss+TIMEZONE，yyyy-MM-DD表示年月日，T出现在字符串中，表示time元素的开头，HH:mm:ss表示时分秒，TIMEZONE表示时区（+08:00表示东八区时间，领先UTC8小时，即北京时间）。例如：2015-05-20T13:29:35+08:00表示，北京时间2015年5月20日13点29分35秒。 */
  time_expire?: string
  /** @description【附加数据】 附加数据，在查询API和支付通知中原样返回，可作为自定义参数使用，实际情况下只有支付完成状态才会返回该字段。 */
  attach?: string
  /** @description【订单优惠标记】 商品标记，代金券或立减优惠功能的参数。 */
  goods_tag?: string
  /** @description【电子发票入口开放标识】 传入true时，支付成功消息和支付详情页将出现开票入口。需要在微信支付商户平台或微信公众平台开通电子发票功能，传此字段才可生效。 */
  support_fapiao?: boolean
  /** @description【优惠功能】 优惠功能 */
  detail?: OrderDetail
  /** @description【场景信息】 支付场景描述 */
  scene_info?: SceneInfo
  /** @description【结算信息】 结算信息 */
  settle_info?: SettleInfo
}

export interface H5Params {
  /** @description【商品描述】 商品描述 */
  description: string
  /** @description【商户订单号】 商户系统内部订单号，只能是数字、大小写字母_-*且在同一个商户号下唯一。 */
  out_trade_no: string
  /** @description【订单金额】 订单金额信息 */
  amount: AmountInfo
  /** @description【交易结束时间】 订单失效时间，遵循rfc3339标准格式，格式为yyyy-MM-DDTHH:mm:ss+TIMEZONE，yyyy-MM-DD表示年月日，T出现在字符串中，表示time元素的开头，HH:mm:ss表示时分秒，TIMEZONE表示时区（+08:00表示东八区时间，领先UTC8小时，即北京时间）。例如：2015-05-20T13:29:35+08:00表示，北京时间2015年5月20日13点29分35秒。 */
  time_expire?: string
  /** @description【附加数据】 附加数据，在查询API和支付通知中原样返回，可作为自定义参数使用，实际情况下只有支付完成状态才会返回该字段。 */
  attach?: string
  /** @description【订单优惠标记】 商品标记，代金券或立减优惠功能的参数。 */
  goods_tag?: string
  /** @description【电子发票入口开放标识】 传入true时，支付成功消息和支付详情页将出现开票入口。需要在微信支付商户平台或微信公众平台开通电子发票功能，传此字段才可生效。 */
  support_fapiao?: boolean
  /** @description【场景信息】 支付场景描述 */
  scene_info?: SceneInfo
  /** @description【结算信息】 结算信息 */
  settle_info?: SettleInfo
}

export interface CloseOrderParams {
  /** @description 【商户订单号】 商户系统内部订单号，只能是数字、大小写字母_-*且在同一个商户号下唯一 */
  out_trade_no: string
}

export interface RefundsParams {
  transaction_id?: string
  out_trade_no?: string
  out_refund_no: string
  /** @description 【退款原因】若商户传入，会在下发给用户的退款消息中体现退款原因 */
  reason?: string
  funds_account?: string
  amount: RefundAmountInfo
  goods_detail?: Array<RefundGoodsDetail>
}

export interface QueryParams {
  out_trade_no?: string
  transaction_id?: string
}

export interface WechatPayNotifySource {
  algorithm: string
  ciphertext: string
  associated_data?: string
  original_type: string
  nonce: string
}

export interface WechatPayNotify {
  id: string
  create_time: string
  event_type: string
  resource_type: string
  resource: WechatPayNotifySource
  summary: string
}

export interface WechatPayDecodeData {
  mchid: string
  appid: string
  out_trade_no: string
  transaction_id: string
  trade_type: string
  trade_state: string
  trade_state_desc: string
  bank_type: string
  attach: string
  success_time: string
  payer: PayerInfo
  amount: AmountInfo
}

export interface PayParams {
  toJSON: () => string
}

export interface PayResponse {
  json: <T>() => T
}

export interface Promotion {
  promotion_id: string
  scope: PromotionScope
  type: PromotionType
  amount: number
  refund_amount: number
  goods_detail?: Array<RefundGoodsDetail>
}
