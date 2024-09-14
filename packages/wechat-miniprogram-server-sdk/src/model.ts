export interface PhoneInfo {
  /** @description 用户绑定的手机号（国外手机号会有区号） */
  phoneNumber: string
  /** @description 没有区号的手机号 */
  purePhoneNumber: string
  /** @description 区号 */
  countryCode: string
  /** @description 数据水印 */
  watermark: Watermark
}

export interface Watermark {
  /** @description 用户获取手机号操作的时间戳 */
  timestamp: number
  /** @description 小程序appid */
  appid: string
}

export interface RetainUV {
  /** @description 标识，0开始，表示当周，1表示1周后。依此类推，取值分别是：0,1,2,3,4 */
  key: string
  /** @description key对应日期的新增用户数/活跃用户数（key=0时）或留存用户数（k>0时） */
  value: string
}

export interface TrendTotal {
  /**
   * @description [`自然月`] 时间，格式为 yyyymm，如："201702"
   * @description [`自然周`] 时间，格式为 yyyymmdd-yyyymmdd，如："20170306-20170312"
   * @description [`自然日`] 时间，格式为 yyyymmdd
   */
  ref_date: string
  /** @description 打开次数（自然月/周/日内汇总） */
  session_cnt: number
  /** @description 访问次数（自然月/周/日内汇总） */
  visit_pv: number
  /** @description 访问人数（自然月/周/日内去重） */
  visit_uv: number
  /** @description 新用户数（自然月/周/日内去重） */
  visit_uv_new: number
  /** @description 人均停留时长 (浮点型，单位：秒) */
  stay_time_uv: number
  /** @description 次均停留时长 (浮点型，单位：秒) */
  stay_time_session: number
  /** @description 平均访问深度 (浮点型) */
  visit_depth: number
}

export interface DecryptDataParams {
  sessionKey: string
  encryptedData: string
  iv: string
}

export interface GetMiniProgramLoginSessionParams {
  /** @description 登录时获取的 code，可通过wx.login获取 */
  code: string
}

export interface CheckMiniProgramLoginSessionParams {
  /** @description 用户登录获得 Session */
  session_key: string
  /** @description 用户唯一标识符 */
  openid: string
}

export interface ResetMiniProgramLoginSessionParams {
  /** @description 用户登录获得 Session */
  session_key: string
  /** @description 用户唯一标识符 */
  openid: string
}

export interface GetPhoneNumberParams {
  /** @description 手机号获取凭证 */
  code: string
}

export interface GetWeeklyAnalysisParams {
  /** @description 开始日期，为周一日期。格式为 yyyymmdd */
  begin_date: string
  /** @description 结束日期，为周日日期，限定查询一周数据。格式为 yyyymmdd */
  end_date: string
}

export interface GetMonthlyAnalysisParams {
  /** @description 开始日期，为自然月第一天。格式为 yyyymmdd */
  begin_date: string
  /** @description 结束日期，为自然月最后一天，限定查询一个月数据。格式为 yyyymmdd */
  end_date: string
}

export interface GetDailyAnalysisParams {
  /** @description 开始日期。格式为 yyyymmdd */
  begin_date: string
  /** @description 结束日期，限定查询1天数据，允许设置的最大值为昨日。格式为 yyyymmdd */
  end_date: string
}
