import { Err, match } from '@starknt/utils'

export class PayError extends Error {
  readonly code: string
  readonly message: string
  readonly name: string = 'PayError'

  constructor(code: string, message: string, stack?: string) {
    super(message, { cause: stack })
    this.code = code
    this.message = message
  }

  static from(err: Error | Err<Error>): PayError {
    if (err instanceof Err)
      return PayError.fromErr(err)

    return PayError.fromError(err)
  }

  private static fromError(error: Error): PayError {
    return new PayError(error.name, error.message, error.stack)
  }

  private static fromErr(err: Err<Error>): PayError {
    return new PayError(err.error.name, err.error.message, err.error.stack)
  }
}

export const UNKNOWN_ERR = Err(new PayError('UNKNOWN', 'UNKNOWN ERROR'))

export enum PAYERROR {
  USER_PAYING = 'USERPAYING',
  APPID_MCHID_NOT_MATCH = 'APPID_MCHID_NOT_MATCH',
  INVALID_REQUEST = 'INVALID_REQUEST',
  MCH_NOT_EXISTS = 'MCH_NOT_EXISTS',
  ORDER_CLOSED = 'ORDER_CLOSED',
  PARAM_ERROR = 'PARAM_ERROR',
  SIGN_ERROR = 'SIGN_ERROR',
  ACCOUNT_ERROR = 'ACCOUNT_ERROR',
  ACCOUNTERROR = 'ACCOUNTERROR',
  NOAUTH = 'NOAUTH',
  OUT_TRADE_NO_USED = 'OUT_TRADE_NO_USED',
  TRADE_ERROR = 'TRADE_ERROR',
  SYSTEMERROR = 'SYSTEMERROR',
  RULELIMIT = 'RULELIMIT',
  ORDERNOTEXIST = 'ORDERNOTEXIST',
  OPENID_MISMATCH = 'OPENID_MISMATCH',
  INVALID_TRANSACTIONID = 'INVALID_TRANSACTIONID',
  FREQUENCY_LIMITED = 'FREQUENCY_LIMITED',
  BANKERROR = 'BANKERROR',
}

export function formatPayError(code: string): PayError {
  return match(code)
    .returnType<PayError>()
  // #region 202
    .with('USER_PAYING', code => new PayError(code, '用户支付中，等待5秒，然后调用被扫订单结果查询API，查询当前订单的不同状态，决定下一步的操作'))
  // #endregion

  // #region 400
    .with('APPID_MCHID_NOT_MATCH', code => new PayError(code, 'appid和mch_id不匹配'))
    .with('INVALID_REQUEST', code => new PayError(code, '无效的请求'))
    .with('MCH_NOT_EXISTS', code => new PayError(code, '商户号不存在'))
    .with('ORDER_CLOSED', code => new PayError(code, '订单已关闭'))
    .with('PARAM_ERROR', code => new PayError(code, '参数错误'))
  // #endregion

  // #region 401
    .with('SIGN_ERROR', code => new PayError(code, '签名错误'))

  // #endregion

  // #region 403
    .with('ACCOUNT_ERROR', code => new PayError(code, '账户异常'))
    .with('ACCOUNTERROR', code => new PayError(code, '账户异常'))
    .with('NOAUTH', code => new PayError(code, '商户无此接口权限'))
    .with('OUT_TRADE_NO_USED', code => new PayError(code, '商户订单号重复'))
    .with('RULELIMIT', code => new PayError(code, '业务规则限制'))
    .with('TRADE_ERROR', code => new PayError(code, '交易错误'))
  // #endregion

  // #region 404
    .with('ORDERNOTEXIST', code => new PayError(code, '订单不存在'))
  // #endregion

  // #region 429
    .with('FREQUENCY_LIMITED', code => new PayError(code, '当前请求该接口频率太快'))
  // #endregion

  // #region 500
    .with('BANKERROR', code => new PayError(code, '银行系统异常'))
    .with('SYSTEMERROR', code => new PayError(code, '系统错误'))
    .with('OPENID_MISMATCH', code => new PayError(code, '用户openid和appid不匹配'))
    .with('INVALID_TRANSACTIONID', code => new PayError(code, '无效的微信订单号'))
  // #endregion
    .otherwise(code => new PayError(code, 'UNKNOWN ERROR'))
}
