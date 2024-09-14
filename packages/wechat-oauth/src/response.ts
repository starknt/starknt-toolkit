export enum Sex {
  Unknown = 0,
  Male = 1,
  Female = 2,
}

export interface AccessToken {
  access_token: string
  expires_in: number
  refresh_token: string
  openid: string
  scope: string
  /** @description 是否为快照页模式虚拟账号，只有当用户是快照页模式虚拟账号时返回，值为1 */
  is_snapshotuser?: number
  unionid?: string
}

export interface SessionKey {
  session_key: string
  openid: string
  unionid?: string
}

export interface UserInfo {
  /** @description 用户的唯一标识 */
  openid: string
  /** @description 用户昵称 */
  nickname: string
  /** @description 用户的性别,值为1时是男性,值为2时是女性,值为0时是未知 */
  sex: Sex
  /** @description 用户个人资料填写的省份 */
  province: string
  /** @description 普通用户个人资料填写的城市 */
  city: string
  /** @description 国家,如中国为CN */
  country: string
  /** @description 用户头像，最后一个数值代表正方形头像大小（有0、46、64、96、132数值可选，0代表640*640正方形头像），用户没有头像时该项为空。若用户更换头像，原有头像URL将失效。 */
  headimgurl: string
  /** @description 用户特权信息, json数组，如微信沃卡用户为(chinaunicom) */
  privilege: string[]
  /** @description 只有在用户将公众号绑定到微信开放平台账号后，才会出现该字段。 */
  unionid: string
}
