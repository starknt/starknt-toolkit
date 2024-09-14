import type { PhoneInfo, RetainUV, TrendTotal } from './model'

export interface AccessTokenResponse {
  /** @description 获取到的凭证 */
  access_token: string
  /** @description 凭证有效时间，单位：秒。目前是7200秒之内的值。 */
  expires_in: number
}

export interface GetMiniProgramLoginSessionResponse extends ErrorResponse {
  session_key: string
  unionid: string
  openid: string
}

export interface CheckMiniProgramLoginSessionResponse extends ErrorResponse {
}

export interface ResetMiniProgramLoginSessionResponse extends ErrorResponse {
  openid: string
  session_key: string
}

export interface GetPhoneNumberResponse extends ErrorResponse {
  /** @description 用户手机号信息 */
  phone_info: PhoneInfo
}

export interface UserRetainResponse {
  /** @description 时间，如："20170306-20170312" */
  ref_data: string
  /** @description 新增用户留存 */
  visit_uv_new: Array<RetainUV>
  /** @description 活跃用户留存 */
  visit_uv: Array<RetainUV>
}

export interface UserVisitTrendResponse {
  /** @description 数据列表 */
  list: Array<TrendTotal>
}

export interface ErrorResponse {
  errcode: number
  errmsg: string
}
