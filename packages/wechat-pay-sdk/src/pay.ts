import { readFileSync } from 'node:fs'
import type { BinaryLike } from 'node:crypto'
import crypto, { X509Certificate, constants } from 'node:crypto'
import { Buffer } from 'node:buffer'
import type { Result } from '@starknt/utils'
import { fetch } from '@starknt/utils/fetch'
import { ACCEPT, ACCEPT_ENCODING, AUTHORIZATION, AsyncResult, CONTENT_TYPE, Err, HeaderMap, HttpMethod, Ok, USER_AGENT, env, format, formatHttpMethod, isDefined, isUndefined, match, parseJSON, stringifyJSON } from '@starknt/utils'
import { AUTH_TYPE } from './define'
import { debug } from './debug'
import { decryptBytes, decryptPayData, sha256Sign, verifySignature } from './sign'
import type { AppParams, CloseOrderParams, H5Params, JsapiParams, MicroParams, NativeParams, PayParams, QueryParams, RefundsParams } from './model'
import { PayError, formatPayError } from './err'
import type { AppResponse, CertificateResponse, CloseOrderResponse, H5Response, JsapiResponse, MicroResponse, NativeResponse, QueryResponse, RefundResponse, SignData } from './response'
import { certificateManager } from './certificates'

function isFailedResponse(code?: string) {
  return isDefined(code) || code !== 'SUCCESS'
}

/**
 * 从 HTTP 请求头中提取参数 `Signature` `Timestamp` `SerialNo` `Nonce`
 * @param headers HTTP 请求头
 */
export function extractVerifyParams(headers: HeadersInit) {
  const map = HeaderMap.fromHeaders(headers)
  const signature = map.getIgnoreCase('Wechatpay-Signature')
  const timestamp = map.getIgnoreCase('Wechatpay-Timestamp')
  const serial_no = map.getIgnoreCase('Wechatpay-Serial')
  const nonce = map.getIgnoreCase('Wechatpay-Nonce')

  return { signature, timestamp, serial_no, nonce }
}

/**
 * 从证书文件中提取证书序列号
 * @param cert 证书文件内容
 */
export function extractSerialNoFromCert(cert: BinaryLike) {
  const x509 = new X509Certificate(cert)
  return x509.serialNumber
}

const BASE_URL = 'https://api.mch.weixin.qq.com'
/** @deprecated v2 sandbox */
const BASE_URL_WITH_SANDBOX = 'https://api.mch.weixin.qq.com/xdc/apiv2sandbox'

export class WechatPayClient {
  protected appid: string
  protected mch_id: string
  protected private_key: string
  protected serial_no: string
  protected v3_key: string
  protected notify_url: string
  protected base_url: string
  protected sandbox: boolean = false

  // #region Helper Function

  private pay<R extends Record<string, any>>(method: HttpMethod, url: string, json: PayParams): AsyncResult<R, PayError> {
    const json_str = json.toJSON()
    debug('json_str: {}', json_str)
    const map = new Map(Object.entries(parseJSON<Record<string, any>, string>(json_str).expect('Parse JSON ERROR')))
    map.set('appid', this.appid)
    map.set('mchid', this.mch_id)
    map.set('notify_url', this.notify_url)
    const body = stringifyJSON(map).expect('stringify JSON ERROR')
    const headers = this.buildHeader(method, url, body)
    url = format('{}{}', this.base_url, url)
    debug('url: {}, body: {}', url, body)

    return new AsyncResult(
      fetch(url, {
        method: formatHttpMethod(method),
        headers: headers.toObject(),
        body,
      }),
    )
      .andThen(async (res) => {
        const json = await res.json()

        if (!res.ok || isFailedResponse(json.code))
          return Err(formatPayError(json.code))

        return Ok(json as R)
      })
      .mapErr((e) => {
        if (e instanceof PayError)
          return e

        return PayError.from(e)
      })
  }

  private getPay<R extends Record<string, any>>(url: string): AsyncResult<R, PayError> {
    const body = ''
    const headers = this.buildHeader(HttpMethod.GET, url, body)
    url = format('{}{}', this.base_url, url)
    debug('url: {}, body: {}', url, body)

    return new AsyncResult(
      fetch(url, {
        method: formatHttpMethod(HttpMethod.GET),
        headers: headers.toObject(),
        body,
      }),
    )
      .andThen(async (res) => {
        const json = await res.json()
        if (!res.ok || isFailedResponse(json.code))
          return Err(formatPayError(json.code))

        return Ok(json as R)
      })
      .mapErr((e) => {
        if (e instanceof PayError)
          return e

        return PayError.from(e)
      })
  }

  public getCertificate(): AsyncResult<CertificateResponse, PayError> {
    const url = '/v3/certificates'
    return this.getPay<CertificateResponse>(url)
  }

  public verifySignature(timestamp: string, nonce: string, serial_no: string, signature: string, body: string): AsyncResult<boolean, unknown> {
    const certificate = certificateManager.get(serial_no)

    if (certificate.isSome())
      return Ok(verifySignature(certificate.value.public_key, timestamp, nonce, signature, body)).toAsyncResult()

    return this.getCertificate()
      .andThen(res => Ok(res.data))
      .andThen((certificates) => {
        if (isUndefined(certificates))
          return Ok(undefined)

        for (const certificate of certificates) {
          const decryptCertificate = this.decryptBytes(
            certificate.encrypt_certificate.ciphertext,
            certificate.encrypt_certificate.nonce,
            certificate.encrypt_certificate.associated_data,
          )

          if (decryptCertificate.isOk()) {
            const { publicKey } = new X509Certificate(Buffer.from(decryptCertificate.value))
            const public_key = publicKey.export({
              type: 'pkcs8',
              format: 'pem',
            })
            certificateManager.set(certificate.serial_no, {
              public_key,
              expires_time: certificate.expire_time,
            })
          }
        }

        return Ok(certificateManager.get(serial_no))
      })
      .andThen((certificate) => {
        if (!certificate || certificate.isNone())
          return Ok(false)

        return Ok(verifySignature(certificate.value.public_key, timestamp, nonce, signature, body))
      })
  }

  public decryptPayData(ciphertext: string, nonce: string, associatedData: string) {
    return decryptPayData(ciphertext, nonce, associatedData, this.v3_key)
  }

  public decryptBytes(ciphertext: string, nonce: string, associatedData: string) {
    return decryptBytes(ciphertext, nonce, associatedData, this.v3_key)
  }

  public changeBaseUrl(base_url: string) {
    this.base_url = base_url
    return this
  }

  private getNowTimestamp() {
    return `${Math.floor(Date.now() / 1000)}`
  }

  private generateNonceStr() {
    return crypto.randomUUID().replace('-', '').toUpperCase()
  }

  private mutSignData(prefix: string, prepay_id: string) {
    const app_id = this.appid
    const timestamp = this.getNowTimestamp()
    const nonce_str = this.generateNonceStr()
    const ext_str = format(
      '{}{}',
      prefix,
      prepay_id,
    )
    const signed_str = this.rsaSign(
      format('{}\n{}\n{}\n{}\n', app_id, timestamp, nonce_str, ext_str),
    )
    return {
      app_id,
      sign_type: 'RSA',
      package: ext_str,
      nonce_str,
      timestamp,
      pay_sign: signed_str,
    } satisfies SignData
  }

  private rsaSign(content: string) {
    return sha256Sign(this.private_key, content)
  }

  private buildHeader(method: HttpMethod, url: string, body: string): HeaderMap {
    const timestamp = this.getNowTimestamp()
    const serial_no = this.serial_no
    const nonce_str = this.generateNonceStr()
    const message = format(
      '{}\n{}\n{}\n{}\n{}\n',
      formatHttpMethod(method),
      url,
      timestamp,
      nonce_str,
      body,
    )
    debug('rsa_sign message: {}', message)
    const signature = this.rsaSign(message)
    const authorization = format(
      `${AUTH_TYPE} mchid="{}",nonce_str="{}",signature="{}",timestamp="{}",serial_no="{}"`,
      this.mch_id,
      nonce_str,
      signature,
      timestamp,
      serial_no,
    )
    debug('authorization: {}', authorization)
    const headers = new HeaderMap()
    headers.insert(ACCEPT, 'application/json')
    headers.insert(USER_AGENT, 'Mozilla/5.0 (Linux; Android 10; Redmi K30 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Mobile Safari/537.36')
    headers.insert(AUTHORIZATION, authorization)
    headers.insert(CONTENT_TYPE, 'application/json')
    headers.insert(ACCEPT_ENCODING, 'gzip')
    return headers
  }

  // #endregion

  // #region 加密接口

  /**
   * 敏感信息加密
   * @param ciphertext 敏感信息字段（如用户的住址、银行卡号、手机号码等）
   */
  public privateDecrypt(ciphertext: string): string {
    return crypto.privateDecrypt({
      key: this.private_key,
      padding: constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha1',
    }, Buffer.from(ciphertext, 'base64')).toString('utf8')
  }

  /**
   * 敏感信息加密
   * @param plaintext 敏感信息字段（如用户的住址、银行卡号、手机号码等）
   */
  public publicEncrypt(plaintext: string): string {
    const certificate = certificateManager.getLatest()

    if (!certificate || certificate.isNone())
      throw new Error('Certificate not found')

    return crypto.publicEncrypt({
      key: certificate.value.public_key,
      padding: constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha1',
    }, Buffer.from(plaintext, 'utf8')).toString('base64')
  }

  // #endregion

  // #region 支付接口

  h5Pay(params: H5Params): AsyncResult<H5Response, PayError> {
    const url = '/v3/pay/transactions/h5'
    return this.pay<H5Response>(HttpMethod.POST, url, {
      toJSON: () => stringifyJSON(params).expect('stringify JSON ERROR'),
    })
  }

  appPay(params: AppParams): AsyncResult<AppResponse, PayError> {
    const url = '/v3/pay/transactions/app'

    return this.pay<AppResponse>(HttpMethod.POST, url, {
      toJSON: () => stringifyJSON(params).expect('stringify JSON ERROR'),
    }).map((res) => {
      if (isDefined(res.prepay_id))
        res.sign_data = this.mutSignData('', res.prepay_id)
      return res
    })
  }

  jsapiPay(params: JsapiParams): AsyncResult<JsapiResponse, PayError> {
    const url = '/v3/pay/transactions/jsapi'

    return this.pay<JsapiResponse>(HttpMethod.POST, url, {
      toJSON: () => stringifyJSON(params).expect('stringify JSON ERROR'),
    }).map((res) => {
      if (isDefined(res.prepay_id))
        res.sign_data = this.mutSignData('', res.prepay_id)
      return res
    })
  }

  microPay(params: MicroParams): AsyncResult<MicroResponse, PayError> {
    const url = '/v3/pay/transactions/jsapi'
    return this.pay<MicroResponse>(HttpMethod.POST, url, {
      toJSON: () => stringifyJSON(params).expect('stringify JSON ERROR'),
    })
      .map((res) => {
        if (isDefined(res.prepay_id))
          res.sign_data = this.mutSignData('', res.prepay_id)
        return res
      })
  }

  nativePay(params: NativeParams): AsyncResult<NativeResponse, PayError> {
    const url = '/v3/pay/transactions/native'
    return this.pay<NativeResponse>(HttpMethod.POST, url, {
      toJSON: () => stringifyJSON(params).expect('stringify JSON ERROR'),
    })
  }

  // #endregion

  // #region 查询接口

  query(params: QueryParams): AsyncResult<QueryResponse, PayError> {
    return match(params)
      .returnType<AsyncResult<QueryResponse, PayError>>()
      .when(params => isDefined(params.transaction_id), (params) => {
        const url = format('/v3/pay/transactions/id/{}?mchid={}', params.transaction_id, this.mch_id)
        return this.getPay<QueryResponse>(url)
      })
      .when(params => isDefined(params.out_trade_no), (params) => {
        const url = format('/v3/pay/transactions/out-trade-no/{}?mchid={}', params.out_trade_no, this.mch_id)
        return this.getPay<QueryResponse>(url)
      })
      .otherwise(() => Err(PayError.from(new Error('invalid params'))).toAsyncResult())
  }

  close(params: CloseOrderParams): AsyncResult<CloseOrderResponse, PayError> {
    const url = `/v3/pay/transactions/out-trade-no/${params.out_trade_no}/close`
    return this.pay<CloseOrderResponse>(HttpMethod.POST, url, {
      toJSON: () => stringifyJSON(params).expect('stringify JSON ERROR'),
    })
  }

  refunds(params: RefundsParams): AsyncResult<RefundResponse, PayError> {
    const url = 'v3/refund/domestic/refunds'
    return this.pay<RefundResponse>(HttpMethod.POST, url, {
      toJSON: () => stringifyJSON(params).expect('stringify JSON ERROR'),
    })
  }

  // #endregion

  // #region 构造器

  constructor(
    appid: string,
    mch_id: string,
    private_key: string | Buffer,
    v3_key: string,
    notify_url: string,
    serial_no: string,
    sandbox: boolean = false,
    base_url: string = sandbox ? BASE_URL_WITH_SANDBOX : BASE_URL,
  ) {
    this.appid = appid
    this.mch_id = mch_id

    if (Buffer.isBuffer(private_key))
      private_key = private_key.toString()

    this.private_key = private_key
    this.serial_no = serial_no
    this.v3_key = v3_key
    this.notify_url = notify_url
    this.sandbox = sandbox
    this.base_url = base_url
  }

  static fromEnv(): Result<WechatPayClient, string> {
    try {
      const appid = env.variable('WECHAT_APPID').expect('WECHAT_APPID not found')
      const mch_id = env.variable('WECHAT_MCH_ID').expect('WECHAT_MCH_ID not found')
      let private_key = env.variable('WECHAT_PRIVATE_KEY').expect('WECHAT_PRIVATE_KEY not found')
      const serial_no = env.variable('WECHAT_SERIAL_NO').expect('WECHAT_SERIAL_NO not found')
      const v3_key = env.variable('WECHAT_V3_KEY').expect('WECHAT_V3_KEY not found')
      const notify_url = env.variable('WECHAT_NOTIFY_URL').expect('WECHAT_NOTIFY_URL not found')
      const sandbox = env.variable('WECHAT_PAY_SANDBOX', false)
      private_key = readFileSync(private_key, 'utf8')

      return Ok(
        new WechatPayClient(
          appid,
          mch_id,
          private_key,
          v3_key,
          notify_url,
          serial_no,
          sandbox.isOk() ? sandbox.value : false,
        ),
      )
    }
    catch (e) {
      if (e instanceof Error)
        return Err(e.message)
      return Err('unknown error')
    }
  }

  // #endregion
}
