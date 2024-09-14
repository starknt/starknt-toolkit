import { AsyncResult, Err, HeaderMap, HttpMethod, Ok, P, formatHttpMethod, formatURL, match } from '@starknt/utils'
import { fetch } from '@starknt/utils/fetch'
import type { AccessToken, SessionKey, UserInfo } from './response'
import type { IAccessTokenStorage } from './storage'
import { AccessTokenStorage } from './storage'

export interface OAuth2Options {
  clientID: string
  clientSecret: string
  storage?: IAccessTokenStorage
}

export class OAuth2 {
  private storage: IAccessTokenStorage
  private defaultQueryMap: HeaderMap

  constructor(private readonly options: OAuth2Options) {
    this.defaultQueryMap = new HeaderMap()
    this.defaultQueryMap.insert('appid', this.options.clientID)
    this.defaultQueryMap.insert('secret', this.options.clientSecret)
    this.storage = options.storage || new AccessTokenStorage()
  }

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

  private request<R>(method: HttpMethod, url: string, queryOrBody: HeaderMap): AsyncResult<R, string> {
    let body: string | undefined
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
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      }),
    )
      .andThen(async (res) => {
        const json = await res.json()

        if (!res.ok || json?.errcode)
          return Err('')

        return Ok(json as R)
      })
      .mapErr((e) => {
        return e as string
      })
  }

  private requestToken<R = AccessToken>(method: HttpMethod, url: string, queryOrBody: HeaderMap): AsyncResult<R, string> {
    let body: string | undefined
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
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      }),
    )
      .andThen(async (res) => {
        const json = await res.json() as AccessToken

        // @ts-expect-error allow
        if (!res.ok || json?.errcode)
          return Err('')

        // process token

        return Ok(json as R)
      })
      .mapErr((e) => {
        return e as string
      })
  }

  getAuthorizeURLForWebsite(redirect: string, state?: string, scope?: string) {
    const url = 'https://open.weixin.qq.com/connect/qrconnect'

    const querymap = new HeaderMap()
      .insert('appid', this.options.clientID)
      .insert('redirect_uri', encodeURI(redirect))
      .insert('response_type', 'code')
      .insert('scope', scope ?? 'snsapi_login')
      .insert('state', state || '')

    return `${formatURL(url, querymap)}#wechat_redirect`
  }

  getAuthorizeURL(redirect: string, state?: string, scope?: string) {
    const url = 'https://open.weixin.qq.com/connect/oauth2/authorize'

    const querymap = new HeaderMap()
      .insert('appid', this.options.clientID)
      .insert('redirect_uri', encodeURI(redirect))
      .insert('response_type', 'code')
      .insert('scope', scope ?? 'snsapi_base')
      .insert('state', state || '')

    return `${formatURL(url, querymap)}#wechat_redirect`
  }

  /**
   * 根据授权获取到的code，换取access token和openid
   * 获取openid之后，可以调用`wechat.API`来获取更多信息
   * Examples:
   * ```
   * api.getAccessToken(code, callback);
   * ```
   * Callback:
   *
   * - `err`, 获取access token出现异常时的异常对象
   * - `result`, 成功时得到的响应结果
   *
   * Result:
   * ```
   * {
   *  data: {
   *    "access_token": "ACCESS_TOKEN",
   *    "expires_in": 7200,
   *    "refresh_token": "REFRESH_TOKEN",
   *    "openid": "OPENID",
   *    "scope": "SCOPE"
   *  }
   * }
   * ```
   * @param {string} code 授权获取到的code
   */
  getAccessToken(code: string) {
    const url = 'https://api.weixin.qq.com/sns/oauth2/access_token'

    const querymap = HeaderMap.fromHeaders(this.defaultQueryMap.toObject())
      .insert('code', code)
      .insert('grant_type', 'authorization_code')

    this.requestToken(HttpMethod.GET, url, querymap)

    return this.request<AccessToken>(HttpMethod.GET, url, querymap)
      .andThen((data) => {
        this.storage.set(data.openid, data)
        return Ok(data)
      })
  }

  getSessionKey(code: string) {
    const url = 'https://api.weixin.qq.com/sns/jscode2session'

    const querymap = HeaderMap.fromHeaders(this.defaultQueryMap.toObject())
      .insert('js_code', code)
      .insert('grant_type', 'authorization_code')

    return this.request<SessionKey>(HttpMethod.GET, url, querymap)
  }

  refreshAccessToken(refreshToken: string) {
    const url = 'https://api.weixin.qq.com/sns/oauth2/refresh_token'

    const querymap = new HeaderMap()
      .insert('appid', this.options.clientID)
      .insert('grant_type', 'refresh_token')
      .insert('refresh_token', refreshToken)

    return this.request<AccessToken>(HttpMethod.GET, url, querymap)
      .andThen((data) => {
        this.storage.set(data.openid, data)
        return Ok(data)
      })
  }

  async verifyToken(openid: string, accessToken: string) {
    const url = 'https://api.weixin.qq.com/sns/auth'

    const querymap = new HeaderMap()
      .insert('openid', openid)
      .insert('access_token', accessToken)

    return this.request(HttpMethod.GET, url, querymap)
      .andThen((data) => {
        // @ts-expect-error allow
        if (data.errcode === 0)
          return Ok(true)

        return Ok(false)
      })
  }

  getUser(openid: string, lang: string = 'zh_CN'): AsyncResult<UserInfo, string> {
    const url = 'https://api.weixin.qq.com/sns/userinfo'

    const item = this.storage.get(openid)

    if (!item)
      return Err('access token not found').toAsyncResult()
    if (this.storage.isValid(item)) {
      const querymap = new HeaderMap()
        .insert('openid', openid)
        .insert('access_token', item.access_token)
        .insert('lang', lang)

      return this.request<UserInfo>(HttpMethod.GET, url, querymap)
    }

    return this.refreshAccessToken(item.refresh_token)
      .map((item) => {
        const querymap = new HeaderMap()
          .insert('openid', openid)
          .insert('access_token', item.access_token)
          .insert('lang', lang)

        return querymap
      })
      .map(async querymap => (await this.request<UserInfo>(HttpMethod.GET, url, querymap).promise).unwrap())
      .mapErr(() => `refresh access token failed`)
  }

  getUserByCode(code: string, lang: string = 'zh_CN'): AsyncResult<UserInfo, string> {
    return this.getAccessToken(code)
      .andThen((item) => {
        return this.getUser(item.openid, lang)
      })
      .mapErr(() => `get access token failed`)
  }
}
