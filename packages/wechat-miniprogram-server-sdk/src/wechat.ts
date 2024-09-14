import crypto from 'node:crypto'
import type { Option, Result } from '@starknt/utils'
import { AsyncResult, Err, HeaderMap, HttpMethod, None, Ok, P, Some, base64Encode, env, format, formatHttpMethod, formatURL, match, parseJSON } from '@starknt/utils'
import { fetch } from '@starknt/utils/fetch'
import type { CheckMiniProgramLoginSessionParams, DecryptDataParams, GetDailyAnalysisParams, GetMiniProgramLoginSessionParams, GetMonthlyAnalysisParams, GetPhoneNumberParams, GetWeeklyAnalysisParams, ResetMiniProgramLoginSessionParams } from './model'
import type { AccessTokenResponse, CheckMiniProgramLoginSessionResponse, GetMiniProgramLoginSessionResponse, GetPhoneNumberResponse, ResetMiniProgramLoginSessionResponse, UserRetainResponse, UserVisitTrendResponse } from './response'
import { WechatAPIError, formatAPIError } from './err'

class AccessTokenStorage {
  #token: Option<string> = None
  #expires: Option<number> = None

  set(token: string, expires: number) {
    const now = Date.now()
    this.#token = Some(token)
    // expires seconds to transform to millisecond
    expires = expires * 1000
    this.#expires = Some(now + expires)
  }

  get token(): Option<string> {
    const now = Date.now()
    if (this.#expires.isSome() && now > this.#expires.value) {
      this.#token = None
      this.#expires = None
    }

    return this.#token
  }
}

export class WeChatMiniprogramClient {
  private readonly storage = new AccessTokenStorage()

  constructor(
    private readonly appid: string,
    private readonly secret: string,
    private base_url = 'https://api.weixin.qq.com',
  ) {}

  private buildBodyOrQuery(url: string, method: HttpMethod, queryOrBody?: HeaderMap): string {
    return match({
      queryOrBody,
      method,
    })
      .returnType<string>()
      .with({
        queryOrBody: P.instanceOf(HeaderMap),
        method: HttpMethod.GET,
      }, ({ queryOrBody }) => formatURL(url, queryOrBody))
      .with({
        queryOrBody: P.instanceOf(HeaderMap),
        method: P.not(HttpMethod.GET),
      }, ({ queryOrBody }) => queryOrBody.toJSON())
      .otherwise(() => url)
  }

  private requestToken<R>(method: HttpMethod, url: string, queryOrBody: HeaderMap): AsyncResult<R, WechatAPIError> {
    let body: string | undefined
    url = format('{}{}', this.base_url, url)
    match(method)
      .with(HttpMethod.GET, () => url = this.buildBodyOrQuery(url, method, queryOrBody))
      .otherwise(() => body = this.buildBodyOrQuery(url, method, queryOrBody))

    return new AsyncResult(
      fetch(url, {
        method: formatHttpMethod(method),
        body,
      }),
    )
      .andThen(async (res) => {
        const json = await res.json()

        if (!res.ok || json?.errcode)
          return Err(formatAPIError(json?.errcode))

        return Ok(json as R)
      })
      .mapErr((e) => {
        if (e instanceof Error)
          return WechatAPIError.from(e)
        return e
      })
  }

  private request<R>(method: HttpMethod, url: string, queryOrBody: HeaderMap): AsyncResult<R, WechatAPIError> {
    let body: string | undefined
    const originURL = url
    url = format('{}{}', this.base_url, url)
    const access_token: string | undefined = this.storage.token.isSome() ? this.storage.token.value : undefined

    if (!access_token) {
      return this.getAccessToken()
        .andThen(({ access_token, expires_in }) => {
          this.storage.set(access_token, expires_in)
          return this.request(method, originURL, queryOrBody)
        })
    }

    url = `${url}?access_token=${access_token}`

    match(method)
      .with(HttpMethod.GET, () => {
        url = this.buildBodyOrQuery(url, method, queryOrBody)
      })
      .otherwise(() => {
        body = this.buildBodyOrQuery(url, method, queryOrBody)
      })

    return new AsyncResult(
      fetch(url, {
        method: formatHttpMethod(method),
        body,
      }),
    )
      .andThen(async (res) => {
        const json = await res.json()

        if (!res.ok || json?.errcode)
          return Err(formatAPIError(json?.errcode))

        return Ok(json as R)
      })
      .mapErr((e) => {
        if (e instanceof Error)
          return WechatAPIError.from(e)
        return e
      })
  }

  changeBaseURL(url: string) {
    this.base_url = url
    return this
  }

  /** @description 登录凭证校验。通过 wx.login 接口获得临时登录凭证 code 后传到开发者服务器调用此接口完成登录流程。更多使用方法详见小程序登录 */
  getMiniProgramLoginSession(params: GetMiniProgramLoginSessionParams) {
    const headers = new HeaderMap()
    headers.insert('appid', this.appid)
    headers.insert('secret', this.secret)
    headers.insert('grant_type', 'authorization_code')
    headers.insert('code', params.code)
    const url = '/sns/jscode2session'
    return this.requestToken<GetMiniProgramLoginSessionResponse>(HttpMethod.GET, url, headers)
  }

  /** @description 校验服务器所保存的登录态 session_key 是否合法。为了保持 session_key 私密性，接口不明文传输 session_key，而是通过校验登录态签名完成 */
  checkMiniProgramLoginSession(params: CheckMiniProgramLoginSessionParams) {
    const headers = new HeaderMap()
    headers.insert('openid', params.openid)
    headers.insert('signature', crypto.createHmac('sha256', params.session_key).update('').digest('hex')) // TODO: hmac_sha256 signature session_key
    headers.insert('sig_method', 'hmac_sha256')
    const url = '/wxa/checksession'
    return this.request<CheckMiniProgramLoginSessionResponse>(HttpMethod.GET, url, headers)
  }

  /** @description 重置指定的登录态 session_key。为了保持 session_key 私密性，接口不明文传入 session_key，而是通过校验登录态签名完成 */
  resetMiniProgramLoginSession(params: ResetMiniProgramLoginSessionParams) {
    const headers = new HeaderMap()
    headers.insert('openid', params.openid)
    headers.insert('signature', crypto.createHmac('sha256', params.session_key).update('').digest('hex')) // TODO: hmac_sha256 signature session_key
    headers.insert('sig_method', 'hmac_sha256')
    const url = '/wxa/resetusersessionkey'
    return this.request<ResetMiniProgramLoginSessionResponse>(HttpMethod.GET, url, headers)
  }

  /** @description 该接口用于将code换取用户手机号。 说明，每个code只能使用一次，code的有效期为5min。 */
  getPhoneNumber(params: GetPhoneNumberParams) {
    const headers = new HeaderMap()
    headers.insert('code', params.code)
    // headers.insert('openid', '') Optional
    const url = '/wxa/business/getuserphonenumber'
    return this.request<GetPhoneNumberResponse>(HttpMethod.POST, url, headers)
  }

  /**
   * @description 该接口用于获取用户访问小程序周留存
   * @description 请求json和返回json与天的一致，这里限定查询一个自然周的数据，时间必须按照自然周的方式输入： 如：20170306(周一), 20170312(周日)
   */
  getWeeklyRetain(params: GetWeeklyAnalysisParams) {
    const headers = new HeaderMap()
    headers.insert('begin_date', params.begin_date)
    headers.insert('end_date', params.end_date)
    const url = '/datacube/getweanalysisappidweeklyretaininfo'
    return this.request<UserRetainResponse>(HttpMethod.POST, url, headers)
  }

  /**
   * @description 该接口用于获取用户访问小程序月留存
   * @description 请求json和返回json与天的一致，这里限定查询一个自然月的数据，时间必须按照自然月的方式输入： 如：20170201(月初), 20170228(月末)
   */
  getMonthlyRetain(params: GetMonthlyAnalysisParams) {
    const headers = new HeaderMap()
    headers.insert('begin_date', params.begin_date)
    headers.insert('end_date', params.end_date)
    const url = '/datacube/getweanalysisappidmonthlyretaininfo'
    return this.request<UserRetainResponse>(HttpMethod.POST, url, headers)
  }

  /**
   * @description 该接口用于获取用户访问小程序日留存
   */
  getDailyRetain(params: GetDailyAnalysisParams) {
    const headers = new HeaderMap()
    headers.insert('begin_date', params.begin_date)
    headers.insert('end_date', params.end_date)
    const url = '/datacube/getweanalysisappiddailyretaininfo'
    return this.request<UserRetainResponse>(HttpMethod.POST, url, headers)
  }

  /**
   * @description 该接口用于获取用户访问小程序数据月趋势(能查询到的最新数据为上一个自然月的数据)
   * @description 限定查询一个自然月的数据，时间必须按照自然月的方式输入： 如：20170301, 20170331
   */
  getMonthlyVisitTrend(params: GetMonthlyAnalysisParams) {
    const headers = new HeaderMap()
    headers.insert('begin_date', params.begin_date)
    headers.insert('end_date', params.end_date)
    const url = '/datacube/getweanalysisappidmonthlyvisittrend'
    return this.request<UserVisitTrendResponse>(HttpMethod.POST, url, headers)
  }

  /**
   * @description 该接口用于获取用户访问小程序数据周趋势
   * @description 限定查询一个自然周的数据，时间必须按照自然周的方式输入： 如：20170306(周一), 20170312(周日)
   */
  getWeeklyVisitTrend(params: GetWeeklyAnalysisParams) {
    const headers = new HeaderMap()
    headers.insert('begin_date', params.begin_date)
    headers.insert('end_date', params.end_date)
    const url = '/datacube/getweanalysisappidweeklyvisittrend'
    return this.request<UserVisitTrendResponse>(HttpMethod.POST, url, headers)
  }

  /**
   * @description 该接口用于获取用户访问小程序数据日趋势
   */
  getDailyVisitTrend(params: GetDailyAnalysisParams) {
    const headers = new HeaderMap()
    headers.insert('begin_date', params.begin_date)
    headers.insert('end_date', params.end_date)
    const url = '/datacube/getweanalysisappiddailyvisittrend'
    return this.request<UserVisitTrendResponse>(HttpMethod.POST, url, headers)
  }

  private getStableAccessToken(force_refresh = false) {
    const headers = new HeaderMap()
    headers.insert('grant_type', 'client_credential')
    headers.insert('appid', this.appid)
    headers.insert('secret', this.secret)
    headers.insert('force_refresh', force_refresh)
    const url = '/cgi-bin/stable_token'
    return this.requestToken<AccessTokenResponse>(HttpMethod.POST, url, headers)
  }

  private getAccessToken() {
    const headers = new HeaderMap()
    headers.insert('grant_type', 'client_credential')
    headers.insert('appid', this.appid)
    headers.insert('secret', this.secret)
    const url = '/cgi-bin/token'
    return this.requestToken<AccessTokenResponse>(HttpMethod.GET, url, headers)
  }

  decryptoData<T extends Record<string, unknown>>(params: DecryptDataParams): Result<T, string> {
    const cipher = crypto.createDecipheriv('AES-128-CBC', base64Encode(params.sessionKey), base64Encode(params.iv))
    cipher.setAutoPadding(true)
    let plaintext = cipher.update(base64Encode(params.encryptedData), 'binary', 'utf8')
    plaintext += cipher.final('utf8')
    return parseJSON(plaintext)
  }

  static fromEnv(): Result<WeChatMiniprogramClient, string> {
    const appid = env.variable('WECHAT_APPID').expect('WECHAT_APPID not found')
    const secret = env.variable('WECHAT_SECRET').expect('WECHAT_SECRET not found')

    return Ok(new WeChatMiniprogramClient(appid, secret))
  }
}
