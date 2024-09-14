import { Err, match } from '@starknt/utils'

export class WechatAPIError extends Error {
  readonly code: number
  readonly name: string = 'WechatAPIError'

  constructor(code: number, message: string, stack?: string) {
    super(message, { cause: stack })
    this.code = code
  }

  static from(err: Error | Err<Error>): WechatAPIError {
    if (err instanceof Err)
      return WechatAPIError.fromErr(err)

    return WechatAPIError.fromError(err)
  }

  private static fromError(error: Error): WechatAPIError {
    return new WechatAPIError(-1, error.message, error.stack)
  }

  private static fromErr(err: Err<Error>): WechatAPIError {
    return new WechatAPIError(-1, err.error.message, err.error.stack)
  }
}

export const UNKNOWN_ERR = Err(new WechatAPIError(-1, 'UNKNOWN ERROR'))

export function formatAPIError(code: number): WechatAPIError {
  return match(code)
    .returnType<WechatAPIError>()
    .with(-1, code => new WechatAPIError(code, '系统繁忙，此时请开发者稍候再试'))
    .with(0, code => new WechatAPIError(code, '请求成功'))
    .with(40001, code => new WechatAPIError(code, 'AppSecret错误或者AppSecret不属于这个公众号，请开发者确认AppSecret的正确性'))
    .with(40002, code => new WechatAPIError(code, '请确保grant_type字段值为client_credential'))
    .with(40013, code => new WechatAPIError(code, '不合法的 AppID ，请开发者检查 AppID 的正确性，避免异常字符，注意大小写'))
    .with(40029, code => new WechatAPIError(code, 'js_code无效'))
    .with(40125, code => new WechatAPIError(code, '请检查 secret 的正确性，避免异常字符，注意大小写'))
    .with(40164, code => new WechatAPIError(code, '调用接口的IP地址不在白名单中，请在接口IP白名单中进行设置。'))
    .with(40226, code => new WechatAPIError(code, '高风险等级用户，小程序登录拦截 。风险等级详见用户安全解方案'))
    .with(40243, code => new WechatAPIError(code, 'AppSecret已被冻结，请登录MP解冻后再次调用。'))
    .with(41004, code => new WechatAPIError(code, '缺少 secret 参数'))
    .with(45011, code => new WechatAPIError(code, 'API 调用太频繁，请稍候再试'))
    .with(50004, code => new WechatAPIError(code, '禁止使用 token 接口'))
    .with(50007, code => new WechatAPIError(code, '账号已冻结'))
    .with(61024, code => new WechatAPIError(code, '第三方平台 API 需要使用第三方平台专用 token'))
    .with(89503, code => new WechatAPIError(code, '此IP调用需要管理员确认,请联系管理员'))
    .with(89501, code => new WechatAPIError(code, '此IP正在等待管理员确认,请联系管理员'))
    .with(89506, code => new WechatAPIError(code, '24小时内该IP被管理员拒绝调用两次，24小时内不可再使用该IP调用'))
    .with(89507, code => new WechatAPIError(code, '1小时内该IP被管理员拒绝调用一次，1小时内不可再使用该IP调用'))
    .otherwise(code => new WechatAPIError(code, '未知错误'))
}
